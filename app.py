from flask import Flask
from views.password_strength import password_strength_bp
from views.generate_password import password_bp
from flask import render_template

app = Flask(__name__, static_folder='static')  # Ensure it's pointing to the 'static' folder

app.register_blueprint(password_strength_bp)
app.register_blueprint(password_bp)

@app.route("/check_password_strength")
def check_password_strength_page():
    return render_template("password_strength.html")

@app.route("/generate_password")
def generate_password_page():
    return render_template("generate_password.html")

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)