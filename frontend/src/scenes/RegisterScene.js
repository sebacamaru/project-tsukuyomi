import registerHTML from "../ui/scenes/auth/register.html?raw";
import "../ui/scenes/auth/auth.css";
import { Scene } from "../core/Scene.js";
import { authService } from "../services/authService.js";
import { router } from "../core/Router.js";

export class RegisterScene extends Scene {
  async getHTML() {
    return registerHTML;
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
    const passwordConfirm = this.$("#password-confirm").value;
    const submitBtn = this.$("#auth-submit");

    if (!email || !password || !passwordConfirm) {
      this.showError("Completa todos los campos");
      return;
    }

    if (password !== passwordConfirm) {
      this.showError("Las contraseñas no coinciden");
      return;
    }

    submitBtn.disabled = true;
    this.clearError();

    const result = await authService.register(email, password);

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
