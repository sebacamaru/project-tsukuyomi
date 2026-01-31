import{i as e,l as t}from"./index-p46PUYUA.js";import{n,t as r}from"./Scene-CdUoGsRA.js";import{t as i}from"./assetRegistry-BWgvEy0G.js";var a=`<div class="admin">
    <div class="container">
        <div class="flex flex-col gap-4">
            <!-- Reset Quest -->
            <div class="box">
                <h2 class="box__title">Gestionar Quest de Usuario</h2>
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
                <h2 class="box__title secondary">Informacion del usuario</h2>
                <div class="box__content">
                    <div id="user-info" class="admin__user-info">
                        <p class="text-muted">
                            Selecciona un usuario para ver sus datos
                        </p>
                    </div>
                </div>
            </div>

            <!-- Dar Items a Usuario -->
            <div class="box">
                <h2 class="box__title secondary">Dar Items a Usuario</h2>
                <div class="box__content">
                    <div class="flex flex-col gap-4">
                        <div class="admin__field">
                            <label class="admin__label" for="give-user-select"
                                >Usuario</label
                            >
                            <select id="give-user-select" class="input">
                                <option value="">
                                    -- Seleccionar usuario --
                                </option>
                            </select>
                        </div>

                        <!-- Dar Huevo -->
                        <div class="admin__give-row">
                            <select
                                id="give-egg-select"
                                class="input input--sm"
                            >
                                <option value="">-- Tipo de huevo --</option>
                            </select>
                            <button
                                id="give-egg-btn"
                                class="button button--small"
                            >
                                Dar Huevo
                            </button>
                        </div>

                        <!-- Dar Caramelo -->
                        <div class="admin__give-row">
                            <select
                                id="give-candy-select"
                                class="input input--sm"
                            >
                                <option value="">-- Caramelo --</option>
                            </select>
                            <input
                                type="number"
                                id="give-candy-quantity"
                                class="input input--xs"
                                value="1"
                                min="1"
                            />
                            <button
                                id="give-candy-btn"
                                class="button button--small"
                            >
                                Dar Caramelo
                            </button>
                        </div>

                        <!-- Dar Piedra -->
                        <div class="admin__give-row">
                            <select
                                id="give-stone-select"
                                class="input input--sm"
                            >
                                <option value="">-- Piedra --</option>
                            </select>
                            <input
                                type="number"
                                id="give-stone-quantity"
                                class="input input--xs"
                                value="1"
                                min="1"
                            />
                            <button
                                id="give-stone-btn"
                                class="button button--small"
                            >
                                Dar Piedra
                            </button>
                        </div>

                        <div id="give-message" class="admin__message"></div>
                    </div>
                </div>
            </div>

            <!-- Editor de Catalogos -->
            <div class="box">
                <h2 class="box__title secondary">Editor de Catalogos</h2>
                <div class="box__content">
                    <div class="flex flex-col gap-4">
                        <!-- Tabs -->
                        <div class="catalog-tabs">
                            <button
                                class="catalog-tab active"
                                data-catalog="egg-types"
                            >
                                Huevos
                            </button>
                            <button
                                class="catalog-tab"
                                data-catalog="candy-types"
                            >
                                Caramelos
                            </button>
                            <button
                                class="catalog-tab"
                                data-catalog="stone-types"
                            >
                                Piedras
                            </button>
                            <button
                                class="catalog-tab"
                                data-catalog="chigo-species"
                            >
                                Especies
                            </button>
                        </div>

                        <!-- Formulario -->
                        <div id="catalog-form" class="catalog-form">
                            <div class="catalog-form__grid">
                                <div class="admin__field">
                                    <label
                                        class="admin__label"
                                        for="catalog-name"
                                        >Name (interno)</label
                                    >
                                    <input
                                        type="text"
                                        id="catalog-name"
                                        class="input"
                                        placeholder="hp_candy_small"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label
                                        class="admin__label"
                                        for="catalog-label"
                                        >Label (visible)</label
                                    >
                                    <input
                                        type="text"
                                        id="catalog-label"
                                        class="input"
                                        placeholder="Caramelo HP Pequeno"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label
                                        class="admin__label"
                                        for="catalog-description"
                                        >Descripcion</label
                                    >
                                    <input
                                        type="text"
                                        id="catalog-description"
                                        class="input"
                                        placeholder="Descripcion"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label
                                        class="admin__label"
                                        for="catalog-icon"
                                        >Icon (path)</label
                                    >
                                    <input
                                        type="text"
                                        id="catalog-icon"
                                        class="input"
                                        placeholder="/assets/candy.png"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label
                                        class="admin__label"
                                        for="catalog-price"
                                        >Precio (0 = no comprable)</label
                                    >
                                    <input
                                        type="number"
                                        id="catalog-price"
                                        class="input"
                                        placeholder="100"
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div
                                id="catalog-message"
                                class="admin__message"
                            ></div>

                            <div class="catalog-form__actions">
                                <button id="save-catalog-btn" class="button">
                                    Crear
                                </button>
                                <button
                                    id="cancel-catalog-btn"
                                    class="button button--secondary hidden"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <!-- Lista -->
                        <div class="catalog-list">
                            <h3 class="catalog-list__title">
                                Elementos del catalogo
                            </h3>
                            <div
                                id="catalog-list-container"
                                class="catalog-list__container"
                            >
                                <p class="text-muted">Cargando...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`,o=`/api/admin`;const s={async getUsers(){return(await fetch(`${o}/users`,{headers:e()})).json()},async getQuests(){return(await fetch(`${o}/quests`,{headers:e()})).json()},async resetQuest(t,n){let r=await fetch(`${o}/reset-quest`,{method:`POST`,headers:e(),body:JSON.stringify({userId:t,questCode:n})});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async getEggTypes(){return(await fetch(`${o}/egg-types`,{headers:e()})).json()},async createEggType(t){let n=await fetch(`${o}/egg-types`,{method:`POST`,headers:e(),body:JSON.stringify(t)});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async updateEggType(t,n){let r=await fetch(`${o}/egg-types/${t}`,{method:`PUT`,headers:e(),body:JSON.stringify(n)});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async deleteEggType(t){let n=await fetch(`${o}/egg-types/${t}`,{method:`DELETE`,headers:e()});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async giveEggToUser(t,n){let r=await fetch(`${o}/users/${t}/give-egg`,{method:`POST`,headers:e(),body:JSON.stringify({eggTypeId:n})});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async getCandyTypes(){return(await fetch(`${o}/candy-types`,{headers:e()})).json()},async createCandyType(t){let n=await fetch(`${o}/candy-types`,{method:`POST`,headers:e(),body:JSON.stringify(t)});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async updateCandyType(t,n){let r=await fetch(`${o}/candy-types/${t}`,{method:`PUT`,headers:e(),body:JSON.stringify(n)});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async deleteCandyType(t){let n=await fetch(`${o}/candy-types/${t}`,{method:`DELETE`,headers:e()});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async giveCandyToUser(t,n,r=1){let i=await fetch(`${o}/users/${t}/give-candy`,{method:`POST`,headers:e(),body:JSON.stringify({candyTypeId:n,quantity:r})});return i.ok?{success:!0,...await i.json()}:{success:!1,error:(await i.json()).error}},async getStoneTypes(){return(await fetch(`${o}/stone-types`,{headers:e()})).json()},async createStoneType(t){let n=await fetch(`${o}/stone-types`,{method:`POST`,headers:e(),body:JSON.stringify(t)});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async updateStoneType(t,n){let r=await fetch(`${o}/stone-types/${t}`,{method:`PUT`,headers:e(),body:JSON.stringify(n)});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async deleteStoneType(t){let n=await fetch(`${o}/stone-types/${t}`,{method:`DELETE`,headers:e()});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async giveStoneToUser(t,n,r=1){let i=await fetch(`${o}/users/${t}/give-stone`,{method:`POST`,headers:e(),body:JSON.stringify({stoneTypeId:n,quantity:r})});return i.ok?{success:!0,...await i.json()}:{success:!1,error:(await i.json()).error}},async getChigoSpecies(){return(await fetch(`${o}/chigo-species`,{headers:e()})).json()},async createSpecies(t){let n=await fetch(`${o}/chigo-species`,{method:`POST`,headers:e(),body:JSON.stringify(t)});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async updateSpecies(t,n){let r=await fetch(`${o}/chigo-species/${t}`,{method:`PUT`,headers:e(),body:JSON.stringify(n)});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async deleteSpecies(t){let n=await fetch(`${o}/chigo-species/${t}`,{method:`DELETE`,headers:e()});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}}};var c=class extends r{constructor(){super(),this.users=[],this.quests=[],this.eggTypes=[],this.candyTypes=[],this.stoneTypes=[],this.chigoSpecies=[],this.currentCatalog=`egg-types`,this.editingId=null}async getHTML(){return a}async initUI(){this.enterCutsceneMode(),await this.loadData(),this.setupEventListeners()}onExit(){this.exitCutsceneMode()}async loadData(){try{let[e,t,n,r,i,a]=await Promise.all([s.getUsers(),s.getQuests(),s.getEggTypes(),s.getCandyTypes(),s.getStoneTypes(),s.getChigoSpecies()]);this.users=e,this.quests=t,this.eggTypes=n,this.candyTypes=r,this.stoneTypes=i,this.chigoSpecies=a,this.populateUserSelect(),this.populateQuestSelect(),this.populateGiveSelects(),this.renderCatalogList()}catch(e){console.error(`Error loading admin data:`,e),this.showMessage(`Error al cargar datos`,`error`)}}populateUserSelect(){let e=this.$(`#user-select`);e.innerHTML=`<option value="">-- Seleccionar usuario --</option>`,this.users.forEach(t=>{let n=document.createElement(`option`);n.value=t.id,n.textContent=`${t.username} (${t.email})`,e.appendChild(n)})}populateQuestSelect(){let e=this.$(`#quest-select`);e.innerHTML=`<option value="">-- Todas completadas (null) --</option>`,this.quests.forEach(t=>{let n=document.createElement(`option`);n.value=t.code,n.textContent=`${t.code} - ${t.name}`,e.appendChild(n)})}populateGiveSelects(){let e=this.$(`#give-user-select`);e.innerHTML=`<option value="">-- Seleccionar usuario --</option>`,this.users.forEach(t=>{let n=document.createElement(`option`);n.value=t.id,n.textContent=`${t.username} (${t.email})`,e.appendChild(n)});let t=this.$(`#give-egg-select`);t.innerHTML=`<option value="">-- Seleccionar tipo de huevo --</option>`,this.eggTypes.forEach(e=>{let n=document.createElement(`option`);n.value=e.id,n.textContent=`${e.label} (${e.name})`,t.appendChild(n)});let n=this.$(`#give-candy-select`);n.innerHTML=`<option value="">-- Seleccionar caramelo --</option>`,this.candyTypes.forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`${e.label} (${e.name})`,n.appendChild(t)});let r=this.$(`#give-stone-select`);r.innerHTML=`<option value="">-- Seleccionar piedra --</option>`,this.stoneTypes.forEach(e=>{let t=document.createElement(`option`);t.value=e.id,t.textContent=`${e.label} (${e.name})`,r.appendChild(t)})}setupEventListeners(){this.$(`#user-select`).addEventListener(`change`,()=>this.onUserChange()),this.$(`#reset-quest-btn`).addEventListener(`click`,()=>this.onResetQuest()),this.onClick(`.catalog-tab`,(e,t)=>{this.$$(`.catalog-tab`).forEach(e=>e.classList.remove(`active`)),t.classList.add(`active`),this.currentCatalog=t.dataset.catalog,this.renderCatalogList(),this.onCancelEdit()}),this.$(`#save-catalog-btn`).addEventListener(`click`,()=>this.onSaveCatalogItem()),this.$(`#cancel-catalog-btn`).addEventListener(`click`,()=>this.onCancelEdit()),this.$(`#catalog-list-container`).addEventListener(`click`,e=>{let t=e.target.closest(`.catalog-row__btn--edit`),n=e.target.closest(`.catalog-row__btn--delete`);t?this.onEditCatalogItem(parseInt(t.dataset.id)):n&&this.onDeleteCatalogItem(parseInt(n.dataset.id))}),this.$(`#give-egg-btn`).addEventListener(`click`,()=>this.onGiveEgg()),this.$(`#give-candy-btn`).addEventListener(`click`,()=>this.onGiveCandy()),this.$(`#give-stone-btn`).addEventListener(`click`,()=>this.onGiveStone())}getCurrentCatalogData(){switch(this.currentCatalog){case`egg-types`:return this.eggTypes;case`candy-types`:return this.candyTypes;case`stone-types`:return this.stoneTypes;case`chigo-species`:return this.chigoSpecies;default:return[]}}renderCatalogList(){let e=this.$(`#catalog-list-container`),t=this.getCurrentCatalogData();if(t.length===0){e.innerHTML=`<p class="text-muted">No hay elementos</p>`;return}e.innerHTML=t.map(e=>{let t=i(e.icon)||e.icon;return`
        <div class="catalog-row" data-id="${e.id}">
          <img class="catalog-row__icon lazy" data-src="${t}" alt="${e.label}" onerror="this.src='https://via.placeholder.com/40'">
          <div class="catalog-row__info">
            <p class="catalog-row__name">${e.label}</p>
            <p class="catalog-row__meta">${e.name}${e.price?` | ${e.price}g`:``}</p>
          </div>
          <div class="catalog-row__actions">
            <button class="catalog-row__btn catalog-row__btn--edit" data-id="${e.id}">Editar</button>
            <button class="catalog-row__btn catalog-row__btn--delete" data-id="${e.id}">X</button>
          </div>
        </div>
      `}).join(``),n(this.root)}onEditCatalogItem(e){let t=this.getCurrentCatalogData().find(t=>t.id===e);t&&(this.editingId=e,this.$(`#catalog-name`).value=t.name,this.$(`#catalog-label`).value=t.label,this.$(`#catalog-description`).value=t.description||``,this.$(`#catalog-icon`).value=t.icon||``,this.$(`#catalog-price`).value=t.price||``,this.$(`#save-catalog-btn`).textContent=`Guardar Cambios`,this.$(`#cancel-catalog-btn`).classList.remove(`hidden`))}onCancelEdit(){this.editingId=null,this.clearCatalogForm(),this.$(`#save-catalog-btn`).textContent=`Crear`,this.$(`#cancel-catalog-btn`).classList.add(`hidden`)}clearCatalogForm(){this.$(`#catalog-name`).value=``,this.$(`#catalog-label`).value=``,this.$(`#catalog-description`).value=``,this.$(`#catalog-icon`).value=``,this.$(`#catalog-price`).value=``}async onSaveCatalogItem(){let e=this.$(`#catalog-name`).value.trim(),t=this.$(`#catalog-label`).value.trim(),n=this.$(`#catalog-description`).value.trim(),r=this.$(`#catalog-icon`).value.trim(),i=parseInt(this.$(`#catalog-price`).value)||0;if(!e||!t){this.showCatalogMessage(`Name y label son requeridos`,`error`);return}let a=this.$(`#save-catalog-btn`);a.disabled=!0,a.textContent=`Guardando...`;try{let a={name:e,label:t,description:n,icon:r,price:i},o;o=this.editingId?await this.updateCatalogItem(this.editingId,a):await this.createCatalogItem(a),o.success?(this.showCatalogMessage(this.editingId?`Actualizado`:`Creado`,`success`),await this.reloadCurrentCatalog(),this.renderCatalogList(),this.onCancelEdit()):this.showCatalogMessage(o.error||`Error al guardar`,`error`)}catch(e){console.error(`Error saving catalog item:`,e),this.showCatalogMessage(`Error de conexión`,`error`)}finally{a.disabled=!1,a.textContent=this.editingId?`Guardar Cambios`:`Crear`}}async createCatalogItem(e){switch(this.currentCatalog){case`egg-types`:return s.createEggType(e);case`candy-types`:return s.createCandyType(e);case`stone-types`:return s.createStoneType(e);case`chigo-species`:return s.createSpecies(e);default:return{success:!1,error:`Catálogo no válido`}}}async updateCatalogItem(e,t){switch(this.currentCatalog){case`egg-types`:return s.updateEggType(e,t);case`candy-types`:return s.updateCandyType(e,t);case`stone-types`:return s.updateStoneType(e,t);case`chigo-species`:return s.updateSpecies(e,t);default:return{success:!1,error:`Catálogo no válido`}}}async onDeleteCatalogItem(e){let t=this.getCurrentCatalogData().find(t=>t.id===e);if(t&&confirm(`¿Eliminar "${t.label}"?`))try{let t;switch(this.currentCatalog){case`egg-types`:t=await s.deleteEggType(e);break;case`candy-types`:t=await s.deleteCandyType(e);break;case`stone-types`:t=await s.deleteStoneType(e);break;case`chigo-species`:t=await s.deleteSpecies(e);break}t.success?(this.showCatalogMessage(`Eliminado`,`success`),await this.reloadCurrentCatalog(),this.renderCatalogList(),this.editingId===e&&this.onCancelEdit()):this.showCatalogMessage(t.error||`Error al eliminar`,`error`)}catch(e){console.error(`Error deleting catalog item:`,e),this.showCatalogMessage(`Error de conexión`,`error`)}}async reloadCurrentCatalog(){switch(this.currentCatalog){case`egg-types`:this.eggTypes=await s.getEggTypes();break;case`candy-types`:this.candyTypes=await s.getCandyTypes();break;case`stone-types`:this.stoneTypes=await s.getStoneTypes();break;case`chigo-species`:this.chigoSpecies=await s.getChigoSpecies();break}this.populateGiveSelects()}showCatalogMessage(e,t=`info`){let n=this.$(`#catalog-message`);n.textContent=e,n.className=`admin__message ${t}`,setTimeout(()=>{n.textContent=``,n.className=`admin__message`},3e3)}async onGiveEgg(){let e=parseInt(this.$(`#give-user-select`).value),t=parseInt(this.$(`#give-egg-select`).value);if(!e||!t){this.showGiveMessage(`Selecciona usuario y tipo de huevo`,`error`);return}let n=this.$(`#give-egg-btn`);n.disabled=!0,n.textContent=`Dando...`;try{let n=await s.giveEggToUser(e,t);n.success?this.showGiveMessage(`Huevo asignado`,`success`):this.showGiveMessage(n.error||`Error`,`error`)}catch{this.showGiveMessage(`Error de conexión`,`error`)}finally{n.disabled=!1,n.textContent=`Dar Huevo`}}async onGiveCandy(){let e=parseInt(this.$(`#give-user-select`).value),t=parseInt(this.$(`#give-candy-select`).value),n=parseInt(this.$(`#give-candy-quantity`).value)||1;if(!e||!t){this.showGiveMessage(`Selecciona usuario y caramelo`,`error`);return}let r=this.$(`#give-candy-btn`);r.disabled=!0,r.textContent=`Dando...`;try{let r=await s.giveCandyToUser(e,t,n);r.success?this.showGiveMessage(`${n}x caramelos asignados`,`success`):this.showGiveMessage(r.error||`Error`,`error`)}catch{this.showGiveMessage(`Error de conexión`,`error`)}finally{r.disabled=!1,r.textContent=`Dar Caramelo`}}async onGiveStone(){let e=parseInt(this.$(`#give-user-select`).value),t=parseInt(this.$(`#give-stone-select`).value),n=parseInt(this.$(`#give-stone-quantity`).value)||1;if(!e||!t){this.showGiveMessage(`Selecciona usuario y piedra`,`error`);return}let r=this.$(`#give-stone-btn`);r.disabled=!0,r.textContent=`Dando...`;try{let r=await s.giveStoneToUser(e,t,n);r.success?this.showGiveMessage(`${n}x piedras asignadas`,`success`):this.showGiveMessage(r.error||`Error`,`error`)}catch{this.showGiveMessage(`Error de conexión`,`error`)}finally{r.disabled=!1,r.textContent=`Dar Piedra`}}showGiveMessage(e,t=`info`){let n=this.$(`#give-message`);n.textContent=e,n.className=`admin__message ${t}`,setTimeout(()=>{n.textContent=``,n.className=`admin__message`},3e3)}onUserChange(){let e=this.$(`#user-select`).value,n=this.$(`#user-info`);if(!e){n.innerHTML=`<p class="text-muted">Selecciona un usuario para ver sus datos</p>`;return}let r=this.users.find(t=>t.id===parseInt(e));if(!r)return;let i=t.user?.id===r.id;n.innerHTML=`
      <p><strong>ID:</strong> ${r.id} ${i?`<span class="badge">Tu usuario</span>`:``}</p>
      <p><strong>Email:</strong> ${r.email}</p>
      <p><strong>Username:</strong> ${r.username}</p>
      <p><strong>Quest actual:</strong> ${r.current_quest_code||`<span class="text-muted">(ninguna)</span>`}</p>
    `}async onResetQuest(){let e=parseInt(this.$(`#user-select`).value),n=this.$(`#quest-select`).value||null;if(!e){this.showMessage(`Selecciona un usuario`,`error`);return}let r=this.$(`#reset-quest-btn`);r.disabled=!0,r.textContent=`Reseteando...`;try{let r=await s.resetQuest(e,n);if(r.success){let i=this.users.findIndex(t=>t.id===e);i!==-1&&(this.users[i]=r.user),t.user?.id===e&&(t.user.current_quest_code=r.user.current_quest_code),this.onUserChange(),this.showMessage(`Quest reseteada a: ${n||`(ninguna)`}`,`success`)}else this.showMessage(r.error||`Error al resetear`,`error`)}catch(e){console.error(`Error resetting quest:`,e),this.showMessage(`Error de conexión`,`error`)}finally{r.disabled=!1,r.textContent=`Guardar`}}showMessage(e,t=`info`){let n=this.$(`#admin-message`);n.textContent=e,n.className=`admin__message ${t}`,setTimeout(()=>{n.textContent=``,n.className=`admin__message`},3e3)}};export{c as AdminScene};