/* ==========================================================
   auth.js — login com Google pelo Firebase Authentication.

   AINDA NÃO CONFIGURADO: falta criar o projeto no Firebase.
   Quando criar (console.firebase.google.com → Adicionar app da Web):
     1. Authentication → Sign-in method → ative "Google".
     2. Authentication → Settings → Authorized domains → adicione o
        domínio do site (ex.: igoortavares.github.io).
     3. Cole abaixo, em FIREBASE_CONFIG, o objeto "firebaseConfig" que o
        console mostra. Esses valores são públicos por natureza (não são
        senha); a proteção vem dos domínios autorizados e das regras.

   O SDK do Firebase só é baixado (do gstatic.com, do Google) quando a
   pessoa toca em "Entrar com o Google". Sem configuração, nada é baixado.

   Por enquanto o login só identifica a pessoa. O progresso continua
   neste aparelho; sincronizar com a nuvem é uma etapa futura.
   ========================================================== */
export const FIREBASE_CONFIG = null;
/* Exemplo:
export const FIREBASE_CONFIG = {
  apiKey: '...', authDomain: 'seu-projeto.firebaseapp.com', projectId: 'seu-projeto', appId: '...',
};
*/

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2';
export const configured = () => !!FIREBASE_CONFIG;

let ctx = null;
async function load() {
  if (ctx) return ctx;
  if (!configured()) throw new Error('Login ainda não configurado.');
  const [{ initializeApp }, A] = await Promise.all([import(`${SDK}/firebase-app.js`), import(`${SDK}/firebase-auth.js`)]);
  const app = initializeApp(FIREBASE_CONFIG);
  ctx = { A, auth: A.getAuth(app) };
  return ctx;
}

/* Abre a janela do Google. Devolve { uid, name, email }. */
export async function signInWithGoogle() {
  const { A, auth } = await load();
  const provider = new A.GoogleAuthProvider();
  let res;
  try { res = await A.signInWithPopup(auth, provider); }
  catch (e) {
    if (e?.code === 'auth/popup-closed-by-user' || e?.code === 'auth/cancelled-popup-request') throw new Error('Janela fechada antes de terminar.');
    if (e?.code === 'auth/unauthorized-domain') throw new Error('Este endereço não está autorizado no Firebase.');
    if (e?.code === 'auth/popup-blocked') throw new Error('O navegador bloqueou a janela do Google. Libere pop-ups e tente de novo.');
    throw new Error(e?.message || 'Falha no login.');
  }
  const u = res.user;
  return { uid: u.uid, name: u.displayName || '', email: u.email || '' };
}

export async function signOut() {
  if (!configured()) return;
  try { const { A, auth } = await load(); await A.signOut(auth); } catch { /* sem rede: sai só localmente */ }
}
