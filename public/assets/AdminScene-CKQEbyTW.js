import{i as e,o as t}from"./index-BbzHd__1.js";import{n,t as r}from"./Scene-BuxfXckF.js";import{t as i}from"./assetRegistry-nONwpp3R.js";var a=`<div class="admin">
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

            <!-- Items Editor -->
            <div class="box">
                <h2 class="box__title secondary">Editor de Items</h2>
                <div class="box__content">
                    <div class="flex flex-col gap-4">
                        <!-- Formulario de item -->
                        <div id="item-form" class="item-form">
                            <div class="item-form__grid">
                                <div class="admin__field">
                                    <label class="admin__label" for="item-name"
                                        >Name (interno)</label
                                    >
                                    <input
                                        type="text"
                                        id="item-name"
                                        class="input"
                                        placeholder="basic_potion"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label class="admin__label" for="item-label"
                                        >Label (visible)</label
                                    >
                                    <input
                                        type="text"
                                        id="item-label"
                                        class="input"
                                        placeholder="Pocion Basica"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label class="admin__label" for="item-price"
                                        >Precio</label
                                    >
                                    <input
                                        type="number"
                                        id="item-price"
                                        class="input"
                                        placeholder="100"
                                        min="0"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label class="admin__label" for="item-type"
                                        >Tipo</label
                                    >
                                    <select id="item-type" class="input">
                                        <option value="misc">Misc</option>
                                        <option value="potion">Potion</option>
                                        <option value="egg">Egg</option>
                                    </select>
                                </div>
                                <div class="admin__field">
                                    <label class="admin__label" for="item-icon"
                                        >Icon (URL/path)</label
                                    >
                                    <input
                                        type="text"
                                        id="item-icon"
                                        class="input"
                                        placeholder="/assets/item.png"
                                    />
                                </div>
                                <div class="admin__field">
                                    <label
                                        class="admin__label"
                                        for="item-description"
                                        >Descripcion</label
                                    >
                                    <input
                                        type="text"
                                        id="item-description"
                                        class="input"
                                        placeholder="Descripcion del item"
                                    />
                                </div>
                            </div>
                            <input type="hidden" id="item-edit-id" value="" />
                            <div
                                id="item-form-message"
                                class="admin__message"
                            ></div>
                            <div class="item-form__actions">
                                <button id="save-item-btn" class="button">
                                    Crear Item
                                </button>
                                <button
                                    id="cancel-item-btn"
                                    class="button button--secondary hidden"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>

                        <!-- Lista de items -->
                        <div class="items-list">
                            <h3 class="items-list__title">Items existentes</h3>
                            <div
                                id="items-list-container"
                                class="items-list__container"
                            >
                                <p class="text-muted">Cargando items...</p>
                            </div>
                        </div>

                        <!-- Acciones peligrosas -->
                        <div class="items-danger">
                            <button
                                id="delete-items-btn"
                                class="button button--danger button--small"
                            >
                                Borrar todos los items
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`,o=`/api/admin`;const s={async getUsers(){return(await fetch(`${o}/users`,{headers:e()})).json()},async getQuests(){return(await fetch(`${o}/quests`,{headers:e()})).json()},async resetQuest(t,n){let r=await fetch(`${o}/reset-quest`,{method:`POST`,headers:e(),body:JSON.stringify({userId:t,questCode:n})});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async deleteAllItems(){let t=await fetch(`${o}/items`,{method:`DELETE`,headers:e()});return t.ok?{success:!0,...await t.json()}:{success:!1,error:(await t.json()).error}},async getItems(){return(await fetch(`${o}/items`,{headers:e()})).json()},async createItem(t){let n=await fetch(`${o}/items`,{method:`POST`,headers:e(),body:JSON.stringify(t)});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}},async updateItem(t,n){let r=await fetch(`${o}/items/${t}`,{method:`PUT`,headers:e(),body:JSON.stringify(n)});return r.ok?{success:!0,...await r.json()}:{success:!1,error:(await r.json()).error}},async deleteItem(t){let n=await fetch(`${o}/items/${t}`,{method:`DELETE`,headers:e()});return n.ok?{success:!0,...await n.json()}:{success:!1,error:(await n.json()).error}}};var c=class extends r{constructor(){super(),this.users=[],this.quests=[],this.items=[],this.editingItemId=null}async getHTML(){return a}async initUI(){this.enterCutsceneMode(),await this.loadData(),this.setupEventListeners()}onExit(){this.exitCutsceneMode()}async loadData(){try{let[e,t,n]=await Promise.all([s.getUsers(),s.getQuests(),s.getItems()]);this.users=e,this.quests=t,this.items=n,this.populateUserSelect(),this.populateQuestSelect(),this.renderItemsList()}catch(e){console.error(`Error loading admin data:`,e),this.showMessage(`Error al cargar datos`,`error`)}}populateUserSelect(){let e=document.getElementById(`user-select`);e.innerHTML=`<option value="">-- Seleccionar usuario --</option>`,this.users.forEach(t=>{let n=document.createElement(`option`);n.value=t.id,n.textContent=`${t.username} (${t.email})`,e.appendChild(n)})}populateQuestSelect(){let e=document.getElementById(`quest-select`);e.innerHTML=`<option value="">-- Todas completadas (null) --</option>`,this.quests.forEach(t=>{let n=document.createElement(`option`);n.value=t.code,n.textContent=`${t.code} - ${t.name}`,e.appendChild(n)})}setupEventListeners(){document.getElementById(`user-select`).addEventListener(`change`,()=>this.onUserChange()),document.getElementById(`reset-quest-btn`).addEventListener(`click`,()=>this.onResetQuest()),document.getElementById(`delete-items-btn`).addEventListener(`click`,()=>this.onDeleteAllItems()),document.getElementById(`save-item-btn`).addEventListener(`click`,()=>this.onSaveItem()),document.getElementById(`cancel-item-btn`).addEventListener(`click`,()=>this.onCancelEdit()),document.getElementById(`items-list-container`).addEventListener(`click`,e=>{let t=e.target.closest(`.item-row__btn--edit`),n=e.target.closest(`.item-row__btn--delete`);if(t){let e=parseInt(t.dataset.id);this.onEditItem(e)}else if(n){let e=parseInt(n.dataset.id);this.onDeleteItem(e)}})}renderItemsList(){let e=document.getElementById(`items-list-container`);if(this.items.length===0){e.innerHTML=`<p class="text-muted">No hay items</p>`;return}e.innerHTML=this.items.map(e=>{let t=i(e.icon)||e.icon;return`
      <div class="item-row" data-id="${e.id}">
        <img class="item-row__icon lazy" data-src="${t}" alt="${e.label}" onerror="this.src='https://via.placeholder.com/40'">
        <div class="item-row__info">
          <p class="item-row__name">${e.label}</p>
          <p class="item-row__meta">${e.name} | ${e.type}</p>
        </div>
        <span class="item-row__price">${e.price}g</span>
        <div class="item-row__actions">
          <button class="item-row__btn item-row__btn--edit" data-id="${e.id}">Editar</button>
          <button class="item-row__btn item-row__btn--delete" data-id="${e.id}">X</button>
        </div>
      </div>
    `}).join(``),n(this.root)}onEditItem(e){let t=this.items.find(t=>t.id===e);t&&(this.editingItemId=e,document.getElementById(`item-name`).value=t.name,document.getElementById(`item-label`).value=t.label,document.getElementById(`item-description`).value=t.description||``,document.getElementById(`item-price`).value=t.price,document.getElementById(`item-icon`).value=t.icon,document.getElementById(`item-type`).value=t.type,document.getElementById(`item-edit-id`).value=e,document.getElementById(`save-item-btn`).textContent=`Guardar Cambios`,document.getElementById(`cancel-item-btn`).classList.remove(`hidden`))}onCancelEdit(){this.editingItemId=null,this.clearItemForm(),document.getElementById(`save-item-btn`).textContent=`Crear Item`,document.getElementById(`cancel-item-btn`).classList.add(`hidden`)}clearItemForm(){document.getElementById(`item-name`).value=``,document.getElementById(`item-label`).value=``,document.getElementById(`item-description`).value=``,document.getElementById(`item-price`).value=``,document.getElementById(`item-icon`).value=``,document.getElementById(`item-type`).value=`misc`,document.getElementById(`item-edit-id`).value=``}async onSaveItem(){let e=document.getElementById(`item-name`).value.trim(),t=document.getElementById(`item-label`).value.trim(),n=document.getElementById(`item-description`).value.trim(),r=parseInt(document.getElementById(`item-price`).value)||0,i=document.getElementById(`item-icon`).value.trim(),a=document.getElementById(`item-type`).value;if(!e||!t||!i){this.showItemMessage(`Name, label e icon son requeridos`,`error`);return}let o=document.getElementById(`save-item-btn`);o.disabled=!0,o.textContent=`Guardando...`;try{let o={name:e,label:t,description:n,price:r,icon:i,type:a},c;c=this.editingItemId?await s.updateItem(this.editingItemId,o):await s.createItem(o),c.success?(this.showItemMessage(this.editingItemId?`Item actualizado`:`Item creado`,`success`),this.items=await s.getItems(),this.renderItemsList(),this.onCancelEdit()):this.showItemMessage(c.error||`Error al guardar`,`error`)}catch(e){console.error(`Error saving item:`,e),this.showItemMessage(`Error de conexion`,`error`)}finally{o.disabled=!1,o.textContent=this.editingItemId?`Guardar Cambios`:`Crear Item`}}async onDeleteItem(e){let t=this.items.find(t=>t.id===e);if(t&&confirm(`¿Eliminar "${t.label}"?`))try{let t=await s.deleteItem(e);t.success?(this.showItemMessage(`Item eliminado`,`success`),this.items=await s.getItems(),this.renderItemsList(),this.editingItemId===e&&this.onCancelEdit()):this.showItemMessage(t.error||`Error al eliminar`,`error`)}catch(e){console.error(`Error deleting item:`,e),this.showItemMessage(`Error de conexion`,`error`)}}showItemMessage(e,t=`info`){let n=document.getElementById(`item-form-message`);n.textContent=e,n.className=`admin__message ${t}`,setTimeout(()=>{n.textContent=``,n.className=`admin__message`},3e3)}onUserChange(){let e=document.getElementById(`user-select`).value,n=document.getElementById(`user-info`);if(!e){n.innerHTML=`<p class="text-muted">Selecciona un usuario para ver sus datos</p>`;return}let r=this.users.find(t=>t.id===parseInt(e));if(!r)return;let i=t.user?.id===r.id;n.innerHTML=`
      <p><strong>ID:</strong> ${r.id} ${i?`<span class="badge">Tu usuario</span>`:``}</p>
      <p><strong>Email:</strong> ${r.email}</p>
      <p><strong>Username:</strong> ${r.username}</p>
      <p><strong>Quest actual:</strong> ${r.current_quest_code||`<span class="text-muted">(ninguna)</span>`}</p>
    `}async onResetQuest(){let e=document.getElementById(`user-select`),n=document.getElementById(`quest-select`),r=parseInt(e.value),i=n.value||null;if(!r){this.showMessage(`Selecciona un usuario`,`error`);return}let a=document.getElementById(`reset-quest-btn`);a.disabled=!0,a.textContent=`Reseteando...`;try{let e=await s.resetQuest(r,i);if(e.success){let n=this.users.findIndex(e=>e.id===r);n!==-1&&(this.users[n]=e.user),t.user?.id===r&&(t.user.current_quest_code=e.user.current_quest_code),this.onUserChange(),this.showMessage(`Quest reseteada a: ${i||`(ninguna)`}`,`success`)}else this.showMessage(e.error||`Error al resetear`,`error`)}catch(e){console.error(`Error resetting quest:`,e),this.showMessage(`Error de conexion`,`error`)}finally{a.disabled=!1,a.textContent=`Guardar`}}showMessage(e,t=`info`){let n=document.getElementById(`admin-message`);n.textContent=e,n.className=`admin__message ${t}`,setTimeout(()=>{n.textContent=``,n.className=`admin__message`},3e3)}async onDeleteAllItems(){if(!confirm(`¿Estás seguro? Se borrarán TODOS los items de la base de datos.`))return;let e=document.getElementById(`delete-items-btn`);e.disabled=!0,e.textContent=`Borrando...`;try{let e=await s.deleteAllItems();e.success?(this.showItemMessage(`Todos los items han sido eliminados`,`success`),this.items=[],this.renderItemsList()):this.showItemMessage(e.error||`Error al borrar items`,`error`)}catch(e){console.error(`Error deleting items:`,e),this.showItemMessage(`Error de conexion`,`error`)}finally{e.disabled=!1,e.textContent=`Borrar todos los items`}}};export{c as AdminScene};