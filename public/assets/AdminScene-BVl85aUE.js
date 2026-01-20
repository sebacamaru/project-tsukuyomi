import{a as e,i as t}from"./index-BGJZ9jUx.js";import{t as n}from"./Scene-Hlsq3uGG.js";var r=`<div class="admin">
    <div class="container">
        <div class="flex flex-col gap-4">
            <!-- Reset Quest -->
            <div class="box">
                <div class="box__content">
                    <div class="flex flex-col gap-4">
                        <div class="admin__field">
                            <label class="admin__label" for="user-select"
                                >Usuario</label
                            >
                            <select id="user-select" class="input">
                                <option value="">Cargando usuarios...</option>
                            </select>
                        </div>

                        <div class="admin__field">
                            <label class="admin__label" for="quest-select"
                                >Quest actual</label
                            >
                            <select id="quest-select" class="input">
                                <option value="">Cargando quests...</option>
                            </select>
                        </div>

                        <div id="admin-message" class="admin__message"></div>

                        <button id="reset-quest-btn" class="button">
                            Guardar
                        </button>
                    </div>
                </div>
            </div>

            <!-- User Info -->
            <div class="box">
                <h2 class="box__title secondary">Información del usuario</h2>
                <div class="box__content">
                    <div id="user-info" class="admin__user-info">
                        <p class="text-muted">
                            Selecciona un usuario para ver sus datos
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`,i=`/api/admin`;const a={async getUsers(){return(await fetch(`${i}/users`,{headers:t()})).json()},async getQuests(){return(await fetch(`${i}/quests`,{headers:t()})).json()},async resetQuest(e,n){let r=await fetch(`${i}/reset-quest`,{method:`POST`,headers:t(),body:JSON.stringify({userId:e,questCode:n})});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}}};var o=class extends n{constructor(){super(),this.users=[],this.quests=[]}async getHTML(){return r}async initUI(){this.enterCutsceneMode(),await this.loadData(),this.setupEventListeners()}onExit(){this.exitCutsceneMode()}async loadData(){try{let[e,t]=await Promise.all([a.getUsers(),a.getQuests()]);this.users=e,this.quests=t,this.populateUserSelect(),this.populateQuestSelect()}catch(e){console.error(`Error loading admin data:`,e),this.showMessage(`Error al cargar datos`,`error`)}}populateUserSelect(){let e=document.getElementById(`user-select`);e.innerHTML=`<option value="">-- Seleccionar usuario --</option>`,this.users.forEach(t=>{let n=document.createElement(`option`);n.value=t.id,n.textContent=`${t.username} (${t.email})`,e.appendChild(n)})}populateQuestSelect(){let e=document.getElementById(`quest-select`);e.innerHTML=`<option value="">-- Todas completadas (null) --</option>`,this.quests.forEach(t=>{let n=document.createElement(`option`);n.value=t.code,n.textContent=`${t.code} - ${t.name}`,e.appendChild(n)})}setupEventListeners(){document.getElementById(`user-select`).addEventListener(`change`,()=>this.onUserChange()),document.getElementById(`reset-quest-btn`).addEventListener(`click`,()=>this.onResetQuest())}onUserChange(){let t=document.getElementById(`user-select`).value,n=document.getElementById(`user-info`);if(!t){n.innerHTML=`<p class="text-muted">Selecciona un usuario para ver sus datos</p>`;return}let r=this.users.find(e=>e.id===parseInt(t));if(!r)return;let i=e.user?.id===r.id;n.innerHTML=`
      <p><strong>ID:</strong> ${r.id} ${i?`<span class="badge">Tu usuario</span>`:``}</p>
      <p><strong>Email:</strong> ${r.email}</p>
      <p><strong>Username:</strong> ${r.username}</p>
      <p><strong>Quest actual:</strong> ${r.current_quest_code||`<span class="text-muted">(ninguna)</span>`}</p>
    `}async onResetQuest(){let t=document.getElementById(`user-select`),n=document.getElementById(`quest-select`),r=parseInt(t.value),i=n.value||null;if(!r){this.showMessage(`Selecciona un usuario`,`error`);return}let o=document.getElementById(`reset-quest-btn`);o.disabled=!0,o.textContent=`Reseteando...`;try{let t=await a.resetQuest(r,i);if(t.success){let n=this.users.findIndex(e=>e.id===r);n!==-1&&(this.users[n]=t.user),e.user?.id===r&&(e.user.current_quest_code=t.user.current_quest_code),this.onUserChange(),this.showMessage(`Quest reseteada a: ${i||`(ninguna)`}`,`success`)}else this.showMessage(t.error||`Error al resetear`,`error`)}catch(e){console.error(`Error resetting quest:`,e),this.showMessage(`Error de conexion`,`error`)}finally{o.disabled=!1,o.textContent=`Guardar`}}showMessage(e,t=`info`){let n=document.getElementById(`admin-message`);n.textContent=e,n.className=`admin__message ${t}`,setTimeout(()=>{n.textContent=``,n.className=`admin__message`},3e3)}};export{o as AdminScene};