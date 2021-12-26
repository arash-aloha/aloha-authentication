const signupForm = document.querySelector('#signup-form');
const logout = document.querySelector('#logout');
const loginForm = document.querySelector('#login-form');
const createForm = document.querySelector('#create-form');
const adminForm = document.querySelector('.admin-actions');

// create new guide
createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  db.collection('guides').add({
    title: createForm['title'].value,
    content: createForm['content'].value,
  }).then(() => {
    //close and reset modal after added data
    const modal = document.querySelector('#modal-create');
    M.Modal.getInstance(modal).close();
    createForm.reset();
  }).catch( error => {
    console.log(error.message)
  })
})

// add  admin cloud function
adminForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const adminEmail = document.querySelector('#admin-email').value;
  const addAdminRole = functions.httpsCallable('addAdminRole');
  addAdminRole({ email: adminEmail }).then(result => {
    console.log(result);
  });
});

// listen for auth status changes
auth.onAuthStateChanged(user => {
  if ( user ) {
    user.getIdTokenResult().then(idTokenResult => {
      user.admin = idTokenResult.claims.admin;
      setupUI( user )
    })
    db.collection('guides').onSnapshot(snapshot => {
      setupGuides( snapshot.docs );
  }, error => {
    console.log(error.message);
  });
  } else {
    setupUI();
    setupGuides([]);
  }
});

// signup
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;
  // sign up the user
  auth.createUserWithEmailAndPassword(email, password).then(userCredentialResponse => {
    return db.collection('users').doc(userCredentialResponse.user.uid).set({
      bio: signupForm['signup-bio'].value
    });
  }).then(() => {
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
    signupForm.querySelector('.error').innerHTML = '';
  }).catch( error => {
    signupForm.querySelector('.error').innerHTML = error.message;
  })
});

// logout
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// login
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  //get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;
  // loggin the user
  auth.signInWithEmailAndPassword(email, password).then(userCredentialResponse => {
    //close login modal and reset the form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
    loginForm.querySelector('.error').innerHTML = '';
  }).catch( error => {
    loginForm.querySelector('.error').innerHTML = error.message;
  })

});