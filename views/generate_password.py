from flask import Blueprint, request, jsonify
import random
import string

# Create a Blueprint
password_bp = Blueprint('password_bp', __name__)

class Password:
    def __init__(self, options):
        self.include_upper = options.get('include_upper', False)
        self.include_lower = options.get('include_lower', False)
        self.include_numbers = options.get('include_numbers', False)
        self.include_special = options.get('include_special', False)
        self.exclude_char = options.get('exclude_char', '')
        self.length = options.get('length', 12)

        self.lowercase = ''.join(c for c in string.ascii_lowercase if c not in self.exclude_char) if self.include_lower else ""
        self.uppercase = ''.join(c for c in string.ascii_uppercase if c not in self.exclude_char) if self.include_upper else ""
        self.digits = ''.join(c for c in string.digits if c not in self.exclude_char) if self.include_numbers else ""
        self.special = ''.join(c for c in "-_.@#$?" if c not in self.exclude_char) if self.include_special else ""

        self.all_characters = self.lowercase + self.uppercase + self.digits + self.special

    def static_random_segment(self):
        segment = ""
        if self.include_lower and self.lowercase:
            segment += random.choice(self.lowercase)
        if self.include_upper and self.uppercase:
            segment += random.choice(self.uppercase)
        if self.include_numbers and self.digits:
            segment += random.choice(self.digits)
        if self.include_special and self.special:
            segment += random.choice(self.special)
        return segment

    def random_segment(self, segment_length):
        utf_chars = ''.join(c for c in string.printable if c not in self.exclude_char)
        return ''.join(random.choice(utf_chars) for _ in range(segment_length))

    def password_generator(self, keyword=""):
        static_part = self.static_random_segment()
        remaining_length = self.length - len(static_part) - len(keyword)
        if remaining_length < 0:
            raise ValueError("Keyword and static part length exceed the specified password length.")
        random_part = self.random_segment(remaining_length)
        password_parts = list(static_part + random_part)
        random.shuffle(password_parts)
        password = ''.join(password_parts)
        if keyword:
            insert_position = random.randint(0, len(password))
            password = password[:insert_position] + keyword + password[insert_position:]
        return password

@password_bp.route("/generate_password", methods=["POST"])
def generate_password():
    data = request.json
    try:
        keyword = data.get("keyword", "")
        options = {
            "include_upper": data.get("include_upper", False),
            "include_lower": data.get("include_lower", False),
            "include_numbers": data.get("include_numbers", False),
            "include_special": data.get("include_special", False),
            "exclude_char": data.get("exclude_char", ""),
            "length": data.get("length", 12),
        }
        password_instance = Password(options)
        password = password_instance.password_generator(keyword=keyword)
        return jsonify({"success": True, "password": password}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400