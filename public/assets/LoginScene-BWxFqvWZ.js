import{n as e,t}from"./index-Do9XzL4n.js";import{t as n}from"./Scene-Bx4WwdoU.js";/* empty css             */var r=`<div class="auth">\r
  <div class="auth__container">\r
    <h1 class="auth__title">Project Tsukuyomi</h1>\r
    <p class="auth__subtitle">Inicia sesion para continuar</p>\r
\r
    <form class="auth__form" id="auth-form">\r
      <div class="auth__field">\r
        <label for="email" class="auth__label">Email</label>\r
        <input\r
          type="email"\r
          id="email"\r
          class="auth__input"\r
          placeholder="tu@email.com"\r
          required\r
          autocomplete="email"\r
        >\r
      </div>\r
\r
      <div class="auth__field">\r
        <label for="password" class="auth__label">Password</label>\r
        <input\r
          type="password"\r
          id="password"\r
          class="auth__input"\r
          placeholder="******"\r
          required\r
          autocomplete="current-password"\r
        >\r
      </div>\r
\r
      <div class="auth__error" id="auth-error"></div>\r
\r
      <button type="submit" class="auth__button" id="auth-submit">\r
        Iniciar sesion\r
      </button>\r
    </form>\r
\r
    <p class="auth__toggle">\r
      <span>No tienes cuenta?</span>\r
      <a href="/register">Registrate</a>\r
    </p>\r
  </div>\r
</div>\r
`,i=class extends n{async getHTML(){return r}async initUI(){this.enterCutsceneMode(),this.on(this.$(`#auth-form`),`submit`,e=>{this.handleSubmit(e)})}async handleSubmit(n){n.preventDefault();let r=this.$(`#email`).value.trim(),i=this.$(`#password`).value,a=this.$(`#auth-submit`);if(!r||!i){this.showError(`Completa todos los campos`);return}a.disabled=!0,this.clearError();let o=await e.login(r,i);a.disabled=!1,o.success?t.navigate(`/`):this.showError(o.error)}showError(e){this.$(`#auth-error`).textContent=e}clearError(){this.$(`#auth-error`).textContent=``}};export{i as LoginScene};