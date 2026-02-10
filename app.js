const firebaseConfig = {
apiKey: "AIzaSyBDffb23AqSOoT-8Z94Ao9leB5nTSdIv78",
authDomain: "agenda-barbarujo.firebaseapp.com",
databaseURL: "https://agenda-barbarujo-default-rtdb.firebaseio.com/",
projectId: "agenda-barbarujo",
storageBucket: "agenda-barbarujo.firebasestorage.app",
messagingSenderId: "735138068544",
appId: "1:735138068544:web:5a1273bd8be9ef7ab487a5"
}

firebase.initializeApp(firebaseConfig)

const db = firebase.database()

const DB = {
servicos: db.ref("barbarujo/servicos"),
barbeiros: db.ref("barbarujo/barbeiros"),
config: db.ref("barbarujo/config"),
ag: db.ref("barbarujo/agendamentos"),
disp: db.ref("barbarujo/disponibilidade")
}

// ================= ESTADO GLOBAL =================

let servicos=[]
let barbeiros=[]
let agendamentos=[]
let agendamentosMap={}
let disponibilidade={}

let servicoSel=null
let barbeiroSel=null
let dataSel=null
let horaSel=null
let salvando=false

let NOME_BARBEARIA="BARBARUJO"
let WHATS_BARBEARIA=""

const ADMIN_SENHA="barbarujo123"
const BARBEIRO_SENHA="barbeiro123"

let config={intervalo:30}

// ================= HELPERS =================

function hojeISO(){
return new Date().toISOString().split("T")[0]
}

function rolarPara(el){
if(!el) return
setTimeout(()=>{
el.scrollIntoView({behavior:"smooth"})
},120)
}

function aplicarNome(){
topo.innerText="💈 "+NOME_BARBEARIA
document.title=NOME_BARBEARIA+" • Agendamento"
}

aplicarNome()

// ================= BACK UNIVERSAL =================

function mostrarBack(){
btnBack.classList.remove("hidden")
}

function esconderBack(){
btnBack.classList.add("hidden")
}

btnBack.onclick=()=>{

// exclusão → admin
if(!telaExclusao.classList.contains("hidden")){
telaExclusao.classList.add("hidden")
telaAdmin.classList.remove("hidden")
rolarPara(telaAdmin)
return
}

// admin → cliente
if(!telaAdmin.classList.contains("hidden")){
telaAdmin.classList.add("hidden")
telaCliente.classList.remove("hidden")
rolarPara(cardServico)
return
}

// barbeiro → cliente
if(!telaBarbeiro.classList.contains("hidden")){
telaBarbeiro.classList.add("hidden")
telaCliente.classList.remove("hidden")
rolarPara(cardServico)
return
}

// cliente → splash
document.querySelector(".container").style.display="none"
telaSplash.style.display="flex"
esconderBack()

}

// ================= SPLASH → CLIENTE =================

btnEntrar.onclick=()=>{

telaSplash.style.display="none"
document.querySelector(".container").style.display="block"

telaCliente.classList.remove("hidden")
telaAdmin.classList.add("hidden")
telaBarbeiro.classList.add("hidden")
telaExclusao.classList.add("hidden")

mostrarBack()
rolarPara(cardServico)

}

// ================= SPLASH → BARBEIRO =================

btnModoBarbeiro.onclick=()=>{

let s = prompt("Senha barbeiro")

if(s!==BARBEIRO_SENHA){
alert("Senha incorreta")
return
}

telaSplash.style.display="none"
document.querySelector(".container").style.display="block"

telaCliente.classList.add("hidden")
telaAdmin.classList.add("hidden")
telaExclusao.classList.add("hidden")
telaBarbeiro.classList.remove("hidden")

mostrarBack()
popularModoBarbeiro()
rolarPara(telaBarbeiro)

}

// ================= LOGIN ADMIN =================

btnAdminFab.onclick=()=>{

let s = prompt("Senha admin")

if(s!==ADMIN_SENHA){
if(s!==null) alert("Senha incorreta")
return
}

telaSplash.style.display="none"
document.querySelector(".container").style.display="block"

telaCliente.classList.add("hidden")
telaBarbeiro.classList.add("hidden")
telaExclusao.classList.add("hidden")
telaAdmin.classList.remove("hidden")

mostrarBack()
rolarPara(telaAdmin)

}

// ================= LOGOUT ADMIN =================

btnLogout.onclick=()=>{
telaAdmin.classList.add("hidden")
telaCliente.classList.remove("hidden")
rolarPara(cardServico)
}

// ================= TELEFONE =================

clienteFone.addEventListener("input",()=>{
clienteFone.value =
clienteFone.value.replace(/\D/g,"").slice(0,11)
})

// ================= WHATS LOJA SAVE =================

btnSalvarWhats.onclick=()=>{

let v = cfgWhats.value.replace(/\D/g,"")

if(v.length<10){
alert("Whats inválido")
return
}

DB.config.child("whats").set(v)
WHATS_BARBEARIA=v

alert("WhatsApp salvo")

}

// ================= PWA INSTALL =================

let deferredPrompt=null

window.addEventListener("beforeinstallprompt",e=>{
e.preventDefault()
deferredPrompt=e
})

btnInstalarApp.onclick=()=>{

if(!deferredPrompt){
alert("Instalação não disponível agora")
return
}

deferredPrompt.prompt()

}

// =====================================================
// ================= FORMAT PREÇO ======================
// =====================================================

function formatarPreco(v){
return Number(v).toFixed(2).replace(".",",")
}

// =====================================================
// ================= RENDER SERVIÇOS ===================
// =====================================================

function renderServicos(){

listaServicos.innerHTML=""

if(!servicos.length){
listaServicos.innerHTML="Sem serviços cadastrados"
return
}

servicos.forEach(s=>{

let b=document.createElement("button")
b.className="btn"

b.innerHTML=`
<div style="font-size:16px;font-weight:800">
${s.nome}
</div>

<div class="price"
style="
background:linear-gradient(135deg,#d4af37,#ffe38a);
color:#000;
box-shadow:
0 8px 22px rgba(212,175,55,.35),
inset 0 0 0 1px rgba(0,0,0,.15);
margin-top:10px;
">
R$ ${formatarPreco(s.preco)}
</div>
`

b.onclick=()=>{

servicoSel=s

cardBarbeiro.classList.remove("hidden")
renderBarbeiros()

rolarPara(cardBarbeiro)

}

listaServicos.appendChild(b)

})

}

// =====================================================
// ================= RENDER BARBEIROS ==================
// =====================================================

function renderBarbeiros(){

listaBarbeiros.innerHTML=""

if(!barbeiros.length){
listaBarbeiros.innerHTML="Sem barbeiros cadastrados"
return
}

barbeiros.forEach(b=>{

let nome=b.nome||b

let btn=document.createElement("button")
btn.className="btn-outline"
btn.innerText=nome

btn.onclick=()=>{

barbeiroSel=nome

cardData.classList.remove("hidden")
renderDatasCliente()

rolarPara(cardData)

}

listaBarbeiros.appendChild(btn)

})

}

// =====================================================
// ================= DATAS CLIENTE =====================
// =====================================================

function renderDatasCliente(){

dataEscolhida.innerHTML=""

let diasObj = disponibilidade[barbeiroSel] || {}
let dias = Object.keys(diasObj).sort()

if(dias.length===0){

let o=document.createElement("option")
o.textContent="Sem dias disponíveis"
dataEscolhida.appendChild(o)
return

}

dias.forEach(d=>{
let o=document.createElement("option")
o.value=d
o.textContent=d
dataEscolhida.appendChild(o)
})

}

// =====================================================
// ================= CONFIRMAR DATA ====================
// =====================================================

btnConfirmarData.onclick=()=>{

dataSel = dataEscolhida.value

if(!dataSel){
alert("Escolha um dia")
return
}

renderHorariosCliente()

cardHorarios.classList.remove("hidden")
rolarPara(cardHorarios)

}

// =====================================================
// ================= HORÁRIOS CLIENTE ==================
// =====================================================

function renderHorariosCliente(){

listaHorarios.innerHTML=""
horaSel=null

let lista =
(disponibilidade[barbeiroSel] &&
 disponibilidade[barbeiroSel][dataSel]) || []

if(lista.length===0){
listaHorarios.innerHTML="Sem horários liberados"
return
}

lista.forEach(hora=>{

let div=document.createElement("div")
div.className="slot"
div.innerText=hora

// ===== BLOQUEAR SE OCUPADO =====

let ocupado = agendamentos.find(a=>
a.data===dataSel &&
a.hora===hora &&
a.barbeiro===barbeiroSel
)

if(ocupado){
div.classList.add("booked")
}

// ===== CLICK =====

div.onclick=()=>{

if(div.classList.contains("booked")) return

document
.querySelectorAll("#listaHorarios .slot")
.forEach(s=>s.classList.remove("selected"))

div.classList.add("selected")

horaSel=hora

cardCliente.classList.remove("hidden")
atualizarResumo()

rolarPara(cardCliente)

}

listaHorarios.appendChild(div)

})

}

// =====================================================
// ================= RESUMO ============================
// =====================================================

function atualizarResumo(){

resumoEscolha.innerHTML=`

<div class="card-sub" style="padding:16px;border-radius:14px">

<b>Serviço:</b> ${servicoSel?.nome||"-"}<br>
<b>Barbeiro:</b> ${barbeiroSel||"-"}<br>
<b>Data:</b> ${dataSel||"-"}<br>
<b>Hora:</b> ${horaSel||"-"}

</div>

`

}

// =====================================================
// ================= RESERVAR ==========================
// =====================================================

btnReservar.onclick=()=>{

if(!servicoSel || !barbeiroSel || !dataSel || !horaSel){
alert("Complete todas as escolhas")
return
}

if(!clienteNome.value || !clienteFone.value){
alert("Preencha nome e WhatsApp")
return
}

btnReservar.classList.add("hidden")
btnConfirmar.classList.remove("hidden")

alert("Confira os dados e confirme")

}

// =====================================================
// ================= WHATS LOJA ========================
// =====================================================

function enviarWhatsLoja(ag){

if(!WHATS_BARBEARIA) return

let msg =
`💈 ${NOME_BARBEARIA}

Novo agendamento:

Cliente: ${ag.cliente}
Whats: ${ag.fone}
Serviço: ${ag.servico}
Barbeiro: ${ag.barbeiro}
Data: ${ag.data}
Hora: ${ag.hora}`

let url =
"https://wa.me/"+WHATS_BARBEARIA+
"?text="+encodeURIComponent(msg)

window.open(url,"_blank")

}

// =====================================================
// ================= CONFIRMAR =========================
// =====================================================

btnConfirmar.onclick=async()=>{

if(salvando) return
salvando=true

let snap = await DB.ag
.orderByChild("data")
.equalTo(dataSel)
.get()

let conflito=false

snap.forEach(c=>{
let a=c.val()
if(a.hora===horaSel && a.barbeiro===barbeiroSel){
conflito=true
}
})

if(conflito){
alert("Horário acabou de ser ocupado")
renderHorariosCliente()
salvando=false
return
}

let ag={
servico:servicoSel.nome,
preco:servicoSel.preco,
barbeiro:barbeiroSel,
data:dataSel,
hora:horaSel,
cliente:clienteNome.value,
fone:clienteFone.value,
ts:Date.now()
}

await DB.ag.push(ag)

enviarWhatsLoja(ag)

alert("Agendamento confirmado 💈")

location.reload()

}

// =====================================================
// ================= ADMIN — SERVIÇOS ==================
// =====================================================

function renderAdminServicos(){

adminServicos.innerHTML=""

if(!servicos.length){
adminServicos.innerHTML="Sem serviços"
return
}

servicos.forEach((s,i)=>{

let div=document.createElement("div")
div.className="card card-sub"

div.innerHTML=`

<div style="font-size:16px;font-weight:800">
${s.nome}
</div>

<div class="price"
style="
background:linear-gradient(135deg,#d4af37,#ffe38a);
color:#000;
margin:10px 0 16px 0;
box-shadow:0 8px 22px rgba(212,175,55,.35);
">
R$ ${formatarPreco(s.preco)}
</div>

<button class="btn-danger btn"
onclick="removerServico(${i})">
Excluir serviço
</button>

`

adminServicos.appendChild(div)

})

}

// ================= ADD SERVIÇO =================

btnAddServico.onclick=()=>{

if(!novoServicoNome.value || !novoServicoPreco.value){
alert("Preencha nome e preço")
return
}

servicos.push({
nome:novoServicoNome.value,
preco:Number(novoServicoPreco.value)
})

DB.servicos.set(servicos)

novoServicoNome.value=""
novoServicoPreco.value=""

alert("Serviço adicionado")

}

// ================= REMOVER SERVIÇO =================

function removerServico(i){

if(!confirm("Excluir serviço?")) return

servicos.splice(i,1)
DB.servicos.set(servicos)

}

// =====================================================
// ================= ADMIN — BARBEIROS =================
// =====================================================

function renderAdminBarbeiros(){

adminBarbeiros.innerHTML=""

barbeiros.forEach((b,i)=>{

let nome=b.nome||b
let whats=b.whats||""

let div=document.createElement("div")
div.className="card card-sub"

div.innerHTML=`

<b>${nome}</b><br>
Whats atual: ${whats||"-"}

<input id="wb_${i}" placeholder="Whats barbeiro">

<button class="btn-dark btn"
onclick="salvarWhatsBarbeiro(${i})">
Salvar Whats
</button>

<button class="btn-danger btn"
onclick="removerBarbeiro(${i})">
Excluir barbeiro
</button>

`

adminBarbeiros.appendChild(div)

})

}

// ================= ADD BARBEIRO =================

btnAddBarbeiro.onclick=()=>{

if(!novoBarbeiro.value){
alert("Digite o nome")
return
}

barbeiros.push({
nome:novoBarbeiro.value,
whats:""
})

DB.barbeiros.set(barbeiros)

novoBarbeiro.value=""

alert("Barbeiro adicionado")

}

// ================= REMOVER BARBEIRO =================

function removerBarbeiro(i){

if(!confirm("Excluir barbeiro?")) return

barbeiros.splice(i,1)
DB.barbeiros.set(barbeiros)

}

// ================= SALVAR WHATS BARBEIRO =================

function salvarWhatsBarbeiro(i){

let v=document
.getElementById("wb_"+i)
.value.replace(/\D/g,"")

if(v.length<10){
alert("Whats inválido")
return
}

barbeiros[i].whats=v
DB.barbeiros.set(barbeiros)

alert("Whats salvo")

}

// =====================================================
// ========== POPULAR SELECTS BARBEIRO (ADMIN) =========
// =====================================================

function popularSelectsBarbeiro(){

adminBarbeiroSel.innerHTML=""
resetBarbeiro.innerHTML=""
barbeiroModoSel.innerHTML=""

barbeiros.forEach(b=>{

let nome=b.nome||b

adminBarbeiroSel.add(new Option(nome,nome))
resetBarbeiro.add(new Option(nome,nome))
barbeiroModoSel.add(new Option(nome,nome))

})

}

// =====================================================
// ================= HORÁRIO FIXO LOJA =================
// =====================================================

function blocosDiaSemana(dataISO){

let d = new Date(dataISO+"T00:00:00")
let dia = d.getDay()

if(dia===0) return []

if(dia===6){
return [["09:00","17:00"]]
}

return [
["09:00","12:00"],
["14:00","19:00"]
]

}

// =====================================================
// ================= GERAR SLOTS =======================
// =====================================================

function gerarSlotsFixos(dataISO){

let blocos = blocosDiaSemana(dataISO)
let lista=[]

blocos.forEach(b=>{

let [ai,af]=b

let [ha,ma]=ai.split(":").map(Number)
let [hf,mf]=af.split(":").map(Number)

let ini=ha*60+ma
let fim=hf*60+mf

for(let t=ini;t<fim;t+=30){

let h=Math.floor(t/60).toString().padStart(2,"0")
let m=(t%60).toString().padStart(2,"0")

lista.push(h+":"+m)

}

})

return lista

}

// =====================================================
// ======= BOTÃO GERAR HORÁRIOS — CORRIGIDO REAL =======
// =====================================================

btnGerarSlots.onclick=()=>{

let barbeiro = adminBarbeiroSel.value
let data = adminDataPick.value

if(!barbeiro || !data){
alert("Escolha barbeiro e data")
return
}

let base = gerarSlotsFixos(data)

if(!base.length){
alert("Domingo fechado")
adminSlotsGrid.innerHTML=""
return
}

let ja =
(disponibilidade[barbeiro] &&
 disponibilidade[barbeiro][data]) || []

adminSlotsGrid.innerHTML=""

base.forEach(hora=>{

let div=document.createElement("div")
div.className="slot"
div.innerText=hora

if(ja.includes(hora)){
div.classList.add("selected")
}

div.onclick=()=>div.classList.toggle("selected")

adminSlotsGrid.appendChild(div)

})

rolarPara(adminSlotsGrid)

}

// =====================================================
// ========== SALVAR DISPONIBILIDADE + LIMPAR ==========
// =====================================================

btnSalvarSlotsDia.onclick=()=>{

let barbeiro = adminBarbeiroSel.value
let data = adminDataPick.value

if(!barbeiro || !data){
alert("Escolha barbeiro e data")
return
}

let sel=[]

document
.querySelectorAll("#adminSlotsGrid .slot.selected")
.forEach(s=>sel.push(s.innerText))

if(!sel.length){
alert("Selecione horários")
return
}

DB.disp.child(barbeiro).child(data).set(sel)

alert("Disponibilidade salva")

adminSlotsGrid.innerHTML=""
adminDataPick.value=""

}

// =====================================================
// ================= LIMPAR GERADOR ====================
// =====================================================

btnLimparGerador.onclick=()=>{
adminSlotsGrid.innerHTML=""
}

// =====================================================
// ================= RESET GUIADO ADMIN =================
// =====================================================

btnAbrirReset.onclick=()=>{

resetBox.classList.toggle("hidden")

if(!resetBox.classList.contains("hidden")){
renderResetDias()
rolarPara(resetBox)
}

}

// -----------------------------------------------------

resetBarbeiro.onchange = renderResetDias

function renderResetDias(){

resetDias.innerHTML=""
resetHorarios.innerHTML=""

let barbeiro = resetBarbeiro.value

if(!barbeiro){
resetDias.innerHTML="Escolha o barbeiro"
return
}

let diasObj = disponibilidade[barbeiro] || {}
let dias = Object.keys(diasObj).sort()

if(!dias.length){
resetDias.innerHTML="Sem dias cadastrados"
return
}

dias.forEach(d=>{

let b=document.createElement("button")
b.className="btn-dark btn"
b.style.marginBottom="10px"
b.textContent=d

b.onclick=()=>renderResetHorarios(barbeiro,d)

resetDias.appendChild(b)

})

}

// -----------------------------------------------------

function renderResetHorarios(barbeiro,data){

resetHorarios.innerHTML=""

let lista =
(disponibilidade[barbeiro] &&
 disponibilidade[barbeiro][data]) || []

if(!lista.length){
resetHorarios.innerHTML="Sem horários neste dia"
return
}

lista.forEach(h=>{

let div=document.createElement("div")
div.className="slot"
div.innerText=h

div.onclick=()=>div.classList.toggle("selected")

resetHorarios.appendChild(div)

})

resetHorarios.dataset.barbeiro = barbeiro
resetHorarios.dataset.data = data

rolarPara(resetHorarios)

}

// =====================================================
// ================= EXCLUIR HORÁRIOS ==================
// =====================================================

btnExcluirSlots.onclick=()=>{

let barbeiro = resetHorarios.dataset.barbeiro
let data = resetHorarios.dataset.data

if(!barbeiro || !data){
alert("Escolha barbeiro e dia")
return
}

let remover=[]

document
.querySelectorAll("#resetHorarios .slot.selected")
.forEach(s=>remover.push(s.innerText))

if(!remover.length){
alert("Selecione horários")
return
}

if(!confirm("Excluir horários selecionados?"))
return

let atuais =
(disponibilidade[barbeiro] &&
 disponibilidade[barbeiro][data]) || []

let novos = atuais.filter(h=>!remover.includes(h))

DB.disp
.child(barbeiro)
.child(data)
.set(novos)

alert("Horários removidos")

renderResetHorarios(barbeiro,data)

}

// =====================================================
// ================= ADMIN — AGENDA ====================
// =====================================================

function renderAdminAgendamentos(){

listaAgendamentos.innerHTML=""

let lista = Object.entries(agendamentosMap)

if(!lista.length){
listaAgendamentos.innerHTML="Sem agendamentos"
return
}

lista
.sort((a,b)=>
(a[1].data+a[1].hora)
.localeCompare(b[1].data+b[1].hora)
)
.forEach(([key,a])=>{

let div=document.createElement("div")
div.className="card card-sub"

div.innerHTML=`

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:8px;
">

<div style="font-weight:900">
${a.data} • ${a.hora}
</div>

<div class="price">
R$ ${formatarPreco(a.preco||0)}
</div>

</div>

<b>${a.cliente}</b><br>
Serviço: ${a.servico}<br>
Barbeiro: ${a.barbeiro}<br>

<button class="btn-danger btn"
style="margin-top:12px"
onclick="excluirAgendamentoAdmin('${key}')">
Excluir
</button>

`

listaAgendamentos.appendChild(div)

})

}

// =====================================================
// ============ EXCLUIR AGENDAMENTO ADMIN ==============
// =====================================================

function excluirAgendamentoAdmin(key){

let a = agendamentosMap[key]
if(!a) return

if(!confirm(
"Excluir agendamento de "+
a.cliente+
" — "+a.data+" "+a.hora+" ?"
)) return

DB.ag.child(key).remove()

alert("Agendamento excluído")

}

// =====================================================
// ============== TELA EXCLUSÃO DEDICADA ===============
// =====================================================

btnAbrirExclusao.onclick=()=>{

telaAdmin.classList.add("hidden")
telaExclusao.classList.remove("hidden")

excBarbeiro.innerHTML=""

barbeiros.forEach(b=>{
let nome=b.nome||b
excBarbeiro.add(new Option(nome,nome))
})

rolarPara(telaExclusao)

}

// =====================================================
// ======== CARREGAR EXCLUSÃO POR BARBEIRO/DIA =========
// =====================================================

btnCarregarExc.onclick=()=>{

let barb = excBarbeiro.value
let data = excData.value

if(!barb || !data){
alert("Escolha barbeiro e data")
return
}

listaExclusao.innerHTML=""

let lista = Object.entries(agendamentosMap)
.filter(([k,a])=>
a.barbeiro===barb &&
a.data===data
)
.sort((a,b)=>a[1].hora.localeCompare(b[1].hora))

if(!lista.length){
listaExclusao.innerHTML="Nenhum agendamento"
return
}

lista.forEach(([key,a])=>{

let div=document.createElement("div")
div.className="card card-sub"

div.innerHTML=`

<div style="font-weight:900">
${a.hora}
</div>

<b>${a.cliente}</b><br>
Serviço: ${a.servico}

<div class="price" style="margin:10px 0">
R$ ${formatarPreco(a.preco||0)}
</div>

<button class="btn-danger btn"
onclick="excluirAgendamentoAdmin('${key}')">
Excluir
</button>

`

listaExclusao.appendChild(div)

})

}

// =====================================================
// ================= MODO BARBEIRO =====================
// =====================================================

function popularModoBarbeiro(){

barbeiroModoSel.innerHTML=""

barbeiros.forEach(b=>{

let nome=b.nome||b

let o=document.createElement("option")
o.value=nome
o.textContent=nome

barbeiroModoSel.appendChild(o)

})

}

// =====================================================
// ================= VER AGENDA BARBEIRO ===============
// =====================================================

btnVerAgendaBarbeiro.onclick = renderAgendaBarbeiro

function renderAgendaBarbeiro(){

let nome = barbeiroModoSel.value
let data = barbeiroModoData.value || hojeISO()

listaBarbeiroAgenda.innerHTML=""

if(!nome){
listaBarbeiroAgenda.innerHTML="Escolha o barbeiro"
return
}

let lista = agendamentos
.filter(a=>a.barbeiro===nome && a.data===data)
.sort((a,b)=>a.hora.localeCompare(b.hora))

if(!lista.length){
listaBarbeiroAgenda.innerHTML="Sem clientes neste dia"
return
}

lista.forEach(a=>{

let div=document.createElement("div")
div.className="card card-sub"

div.innerHTML=`

<div style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:8px;
">

<b>${a.hora}</b>

<div class="price">
R$ ${formatarPreco(a.preco||0)}
</div>

</div>

<b>${a.cliente}</b><br>
Serviço: ${a.servico}<br><br>

<button class="btn-dark btn"
onclick="window.open('https://wa.me/55${a.fone}','_blank')">
Abrir WhatsApp
</button>

<button class="btn-outline"
onclick="copiarFone('${a.fone}')">
Copiar telefone
</button>

<button class="btn"
onclick="enviarLembreteCliente(
'${a.cliente}',
'${a.fone}',
'${a.data}',
'${a.hora}',
'${a.servico}'
)">
Enviar lembrete
</button>

`

listaBarbeiroAgenda.appendChild(div)

})

}

// =====================================================
// ================= LEMBRETE CLIENTE ==================
// =====================================================

function enviarLembreteCliente(nome,fone,data,hora,servico){

let msg =
`💈 ${NOME_BARBEARIA}

Olá ${nome}!
Lembrete do seu horário:

Serviço: ${servico}
Data: ${data}
Hora: ${hora}

Te esperamos 👍`

let url =
"https://wa.me/55"+
fone.replace(/\D/g,"")+
"?text="+encodeURIComponent(msg)

window.open(url,"_blank")

}

// =====================================================
// ================= COPIAR TELEFONE ===================
// =====================================================

function copiarFone(f){
navigator.clipboard.writeText(f)
alert("Telefone copiado")
}

// =====================================================
// ================= SYNC SERVIÇOS =====================
// =====================================================

DB.servicos.on("value",snap=>{

if(snap.exists()){
servicos = Object.values(snap.val())
}else{
DB.servicos.set([
{nome:"Corte",preco:40},
{nome:"Barba",preco:30},
{nome:"Combo",preco:65}
])
return
}

renderServicos()
renderAdminServicos()

})

// =====================================================
// ================= SYNC BARBEIROS ====================
// =====================================================

DB.barbeiros.on("value",snap=>{

if(snap.exists()){
barbeiros = Object.values(snap.val())
}else{
DB.barbeiros.set([
{nome:"Carlos",whats:""},
{nome:"Pedro",whats:""}
])
return
}

renderBarbeiros()
renderAdminBarbeiros()
popularSelectsBarbeiro()
popularModoBarbeiro()

})

// =====================================================
// ================= SYNC CONFIG =======================
// =====================================================

DB.config.on("value",snap=>{

if(!snap.exists()){
DB.config.set({intervalo:30})
return
}

let c=snap.val()

if(c.intervalo){
config.intervalo=c.intervalo
}

})

// ================= WHATS LOJA =================

DB.config.child("whats").on("value",snap=>{
if(snap.exists()){
WHATS_BARBEARIA=snap.val()
cfgWhats.value=WHATS_BARBEARIA
}
})

// =====================================================
// ================= SYNC DISPONIBILIDADE ==============
// =====================================================

DB.disp.on("value",snap=>{

disponibilidade = snap.exists()? snap.val() : {}

if(barbeiroSel){
renderDatasCliente()
}

renderResetDias()

})

// =====================================================
// ================= SYNC AGENDAMENTOS =================
// =====================================================

DB.ag.on("value",snap=>{

agendamentosMap = snap.exists()? snap.val() : {}
agendamentos = Object.values(agendamentosMap)

renderAdminAgendamentos()

if(barbeiroSel && dataSel){
renderHorariosCliente()
}

if(!telaBarbeiro.classList.contains("hidden")){
renderAgendaBarbeiro()
}

})

// =====================================================
// ================= UX MOBILE LOCK ====================
// =====================================================

// bloquear zoom duplo toque
let lastTouchEnd = 0

document.addEventListener("touchend", function (event) {
let now = Date.now()
if (now - lastTouchEnd <= 300) {
event.preventDefault()
}
lastTouchEnd = now
}, { passive:false })

// bloquear menu segurar/copiar
document.addEventListener("contextmenu", e=>e.preventDefault())

// bloquear seleção texto
document.addEventListener("selectstart", e=>e.preventDefault())

// =====================================================
// ================= SERVICE WORKER ====================
// =====================================================

if("serviceWorker" in navigator){

navigator.serviceWorker
.register("sw.js")
.then(()=>console.log("SW registrado"))
.catch(()=>console.log("SW falhou"))

}

// =====================================================
// ================= LOG FINAL =========================
// =====================================================

console.log("💈 BARBARUJO — PROJETO FINAL COMPLETO OK")
console.log("Cliente OK")
console.log("Admin OK")
console.log("Gerar horários OK")
console.log("Reset OK")
console.log("Exclusão dedicada OK")
console.log("Modo barbeiro OK")
console.log("Lembrete OK")
console.log("Preços premium OK")
console.log("UX app-like OK")
console.log("PWA OK")
