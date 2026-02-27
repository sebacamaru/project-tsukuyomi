import{n as e,r as t}from"./index-7r-Yw5Rn.js";import{t as n}from"./Scene-6Sn1BImB.js";/* empty css             */var r=`<div class="auth">
    <div class="auth__container">
        <p class="auth__subtitle">Crear una cuenta</p>

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
                    autocomplete="new-password"
                />
            </div>

            <div class="auth__field">
                <label for="password-confirm" class="auth__label"
                    >Confirmar contraseña</label
                >
                <input
                    type="password"
                    id="password-confirm"
                    class="input"
                    placeholder="******"
                    required
                    autocomplete="new-password"
                />
            </div>

            <div class="auth__error" id="auth-error"></div>

            <button type="submit" class="button" id="auth-submit">
                Registrarse
            </button>
        </form>

        <p class="auth__toggle">
            <span>¿Ya tenés cuenta?</span>
            <a href="/login">Inicia sesión</a>
        </p>
    </div>
</div>
`,i=class extends n{async getHTML(){return r}async initUI(){this.enterCutsceneMode(),this.on(this.$(`#auth-form`),`submit`,e=>{this.handleSubmit(e)})}async handleSubmit(n){n.preventDefault();let r=this.$(`#email`).value.trim(),i=this.$(`#password`).value,a=this.$(`#password-confirm`).value,o=this.$(`#auth-submit`);if(!r||!i||!a){this.showError(`Completa todos los campos`);return}if(i!==a){this.showError(`Las contraseñas no coinciden`);return}o.disabled=!0,this.clearError();let s=await t.register(r,i);o.disabled=!1,s.success?e.navigate(`/`):this.showError(s.error)}showError(e){this.$(`#auth-error`).textContent=e}clearError(){this.$(`#auth-error`).textContent=``}};export{i as RegisterScene};