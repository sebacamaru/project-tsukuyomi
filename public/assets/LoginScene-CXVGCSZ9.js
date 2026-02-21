import{n as e,r as t}from"./index-fQczqod7.js";import{t as n}from"./Scene-DQmjfrAv.js";/* empty css             */var r=`<div class="auth">
    <div class="auth__container">
        <p class="auth__subtitle">Inicia sesión para continuar</p>

        <form class="auth__form" id="auth-form">
            <div class="auth__field">
                <label for="email" class="auth__label">E-mail</label>
                <input
                    type="email"
                    id="email"
                    class="input"
                    placeholder="tu@email.com"
                    required
                    autocomplete="email"
                />
            </div>

            <div class="auth__field">
                <label for="password" class="auth__label">Contraseña</label>
                <input
                    type="password"
                    id="password"
                    class="input"
                    placeholder="******"
                    required
                    autocomplete="current-password"
                />
            </div>

            <div class="auth__error" id="auth-error"></div>

            <button type="submit" class="button" id="auth-submit">
                Iniciar sesión
            </button>
        </form>

        <p class="auth__toggle">
            <span>¿No tenés cuenta?</span>
            <a href="/register">Registrate</a>
        </p>
    </div>
</div>
`,i=class extends n{async getHTML(){return r}async initUI(){this.enterCutsceneMode(),this.on(this.$(`#auth-form`),`submit`,e=>{this.handleSubmit(e)})}async handleSubmit(n){n.preventDefault();let r=this.$(`#email`).value.trim(),i=this.$(`#password`).value,a=this.$(`#auth-submit`);if(!r||!i){this.showError(`Completa todos los campos`);return}a.disabled=!0,this.clearError();let o=await t.login(r,i);a.disabled=!1,o.success?e.navigate(`/`):this.showError(o.error)}showError(e){this.$(`#auth-error`).textContent=e}clearError(){this.$(`#auth-error`).textContent=``}};export{i as LoginScene};