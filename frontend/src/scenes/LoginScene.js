import loginHTML from "../ui/scenes/auth/login.html?raw";
import "../ui/scenes/auth/auth.css";
import { Scene } from "../core/Scene.js";
import { authService } from "../services/authService.js";
import { router } from "../core/Router.js";

export class LoginScene extends Scene {
  async getHTML() {
    return loginHTML;
  }

  async initUI() {
    this.enterCutsceneMode();

    this.on(this.$("#auth-form"), "submit", (e) => {
      this.handleSubmit(e);
    });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const email = this.$("#email").value.trim();
    const password = this.$("#password").value;
    const submitBtn = this.$("#auth-submit");

    if (!email || !password) {
      this.showError("Completa todos los campos");
      return;
    }

    submitBtn.disabled = true;
    this.clearError();

    const result = await authService.login(email, password);

    submitBtn.disabled = false;

    if (result.success) {
      router.navigate("/");
    } else {
      this.showError(result.error);
    }
  }

  showError(message) {
    this.$("#auth-error").textContent = message;
  }

  clearError() {
    this.$("#auth-error").textContent = "";
  }
}
