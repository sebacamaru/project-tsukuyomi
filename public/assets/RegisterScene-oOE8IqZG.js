import{n as e,t}from"./index-Do9XzL4n.js";import{t as n}from"./Scene-Bx4WwdoU.js";/* empty css             */var r=`<div class="auth">
    <div class="auth__container">
        <h1 class="auth__title">Project Tsukuyomi</h1>
        <p class="auth__subtitle">Crea una cuenta nueva</p>

        <form class="auth__form" id="auth-form">
            <div class="auth__field">
                <label for="email" class="auth__label">Email</label>
                <input
                    type="email"
                    id="email"
                    class="auth__input"
                    placeholder="tu@email.com"
                    required
                    autocomplete="email"
                />
            </div>

            <div class="auth__field">
                <label for="password" class="auth__label">Password</label>
                <input
                    type="password"
                    id="password"
                    class="auth__input"
                    placeholder="******"
                    required
                    autocomplete="new-password"
                />
            </div>

            <div class="auth__field">
                <label for="password-confirm" class="auth__label"
                    >Confirmar Password</label
                >
                <input
                    type="password"
                    id="password-confirm"
                    class="auth__input"
                    placeholder="******"
                    required
                    autocomplete="new-password"
                />
            </div>

            <div class="auth__error" id="auth-error"></div>

            <button type="submit" class="auth__button" id="auth-submit">
                Registrarse
            </button>
        </form>

        <p class="auth__toggle">
            <span>Ya tienes cuenta?</span>
            <a href="/login">Inicia sesion</a>
        </p>
    </div>
</div>
`,i=class extends n{async getHTML(){return r}async initUI(){this.enterCutsceneMode(),this.on(this.$(`#auth-form`),`submit`,e=>{this.handleSubmit(e)})}async handleSubmit(n){n.preventDefault();let r=this.$(`#email`).value.trim(),i=this.$(`#password`).value,a=this.$(`#password-confirm`).value,o=this.$(`#auth-submit`);if(!r||!i||!a){this.showError(`Completa todos los campos`);return}if(i!==a){this.showError(`Las contraseñas no coinciden`);return}o.disabled=!0,this.clearError();let s=await e.register(r,i);o.disabled=!1,s.success?t.navigate(`/`):this.showError(s.error)}showError(e){this.$(`#auth-error`).textContent=e}clearError(){this.$(`#auth-error`).textContent=``}};export{i as RegisterScene};