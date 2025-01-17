from flask import Blueprint, render_template, request
from flask import jsonify
from zxcvbn import zxcvbn
import hashlib
import requests

password_strength_bp = Blueprint("password_strength", __name__, template_folder="../templates")

class PasswordStrengthChecker:
    def owasp_length_rating(self, password: str) -> int:
        length = len(password)
        if 12 <= length <= 16:
            return 1
        elif 17 <= length <= 32:
            return 2
        elif 33 <= length <= 48:
            return 3
        elif 49 <= length <= 64:
            return 4
        elif length > 64:
            return 5
        return 0

    def pwned_password_check(self, password: str) -> dict:
        sha1_hash = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
        url = f"https://api.pwnedpasswords.com/range/{sha1_hash[:5]}"
        try:
            response = requests.get(url)
            response.raise_for_status()
            hashes = response.text.splitlines()
            for hash_count in hashes:
                if hash_count.startswith(sha1_hash[5:]):
                    count = int(hash_count.split(":")[1])
                    return {"pwned": True, "count": count}
        except requests.exceptions.RequestException:
            return {"pwned": False, "count": 0}
        return {"pwned": False, "count": 0}

    def zxcvbn_password_strength(self, password: str) -> dict:
        result = zxcvbn(password)
        score = result["score"]
        strength = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][score]
        feedback = result["feedback"]["suggestions"] or "Good password."
        crack_time = result["crack_times_display"]["online_no_throttling_10_per_second"]
        pwned_info = self.pwned_password_check(password)
        length_rating = self.owasp_length_rating(password)
        return {
            "strength": strength,
            "feedback": feedback,
            "crack_time": crack_time,
            "pwned": pwned_info["pwned"],
            "pwned_count": pwned_info["count"],
            "length_rating": length_rating,
        }

@password_strength_bp.route("/password_strength", methods=["POST"])
def password_strength():
    data = request.get_json()
    password = data.get("password")
    checker = PasswordStrengthChecker()
    result = checker.zxcvbn_password_strength(password)
    return jsonify(result) 