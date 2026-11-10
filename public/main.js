const registerButton = document.getElementById('monBouton4');
const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('login');
const decoBtn = document.getElementById('decoBtn');
const supprBtn = document.getElementById('supprBtn');
const text = document.getElementById('text');
const afficherUserBtn = document.getElementById('afficherUserBtn');
const userListContainer = document.getElementById('userList');
let currentUser = null;
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changemdpBtn = document.getElementById('changemdp');
const phoenixImage = document.getElementById('phoenixImage');
const surpriseButton = document.getElementById('surprise');

import {LeafletMap, TileLayer, Marker, Polyline, Polygon, Popup} from 'leaflet';
const map = new LeafletMap('map').setView([50.419456, 1.575165], 11);

const tiles = new TileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const points = [
	[5022.5107, 160.3967],
	[5023.6107, 158.7015],
	[5025.1861, 156.6503],
	[5025.7349, 154.2812],
	[5027.3260, 153.1998],
	[5029.2127, 153.1742],
	[5030.7917, 153.5688],
	[5032.6715, 154.0238],
	[5034.7204, 154.4787],
	[5036.4400, 155.1739],
	[5036.8285, 159.1992],
	[5038.3506, 157.5001],
	[5039.3025, 156.1482],
	[5040.7416, 155.5962],
	[5041.9830, 156.1059],
	[5043.5218, 156.6036],
	[5045.2572, 156.9130],
	[5047.1929, 157.2105],
	[5048.6914, 157.4046],
	[5050.2678, 157.5400],
	[5051.7114, 157.4794],
	[5053.5210, 158.1106],
	[5054.1421, 160.0467],
	[5056.4056, 157.8373]
];

for (var i = 0; i < points.length; i++) {
	points[i][0] /= 100;
	points[i][1] /= 100;
	const marker = new Marker([points[i][0], points[i][1]]).addTo(map);
}

for (var i = 0; i < points.length - 1; i++) {
	const polyline = new Polyline([
		[points[i][0], points[i][1]],
		[points[i+1][0], points[i+1][1]]
	]).addTo(map);
}

function onMapClick(e) {
	new Popup()
		.setLatLng(e.latlng)
		.setContent(e.latlng.toString())
		.openOn(map);
}

map.on('click', onMapClick);

//fonction inscription 
monBouton4.addEventListener('click', () => {
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputValue: loginInput.value, password: passwordInput.value })
    }).then(response => response.text())
        .then(data => {
            alert(data);
        });
});


//fonction se connecter
loginButton.addEventListener('click', () => {
    fetch('/connexion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login: loginInput.value, password: passwordInput.value })
    }).then(response => response.json())
        .then(data => {
            if (data.message === 'Connexion réussie !') {
                alert(data.message);
                localStorage.setItem('token', data.token);
            } else {
                alert(data.message);
            }

            //refresh de la page 
            window.location.reload();
        });
});

function afficherEtatConnexion(user) {
    currentUser = user;
    const isAdmin = user && user.login === 'admin';
    afficherUserBtn.style.display = isAdmin ? 'block' : 'none';
    userListContainer.style.display = 'none';
    decoBtn.style.display = user ? 'block' : 'none';
    supprBtn.style.display = user && !isAdmin ? 'block' : 'none';
    changePasswordBtn.style.display = user ? 'block' : 'none';

    if (user) {
        loginInput.style.display = 'none';
        passwordInput.style.display = 'none';
        loginButton.style.display = 'none';
        registerButton.style.display = 'none';
        decoBtn.style.display = 'block';
        supprBtn.style.display = 'block';
        text.textContent = `Bienvenue ${user.login} !`;
        changemdpBtn.style.display = 'block';
        surpriseButton.style.display = 'block';
    } else {
        loginInput.style.display = 'block';
        passwordInput.style.display = 'block';
        loginButton.style.display = 'block';
        registerButton.style.display = 'block';
        decoBtn.style.display = 'none';
        supprBtn.style.display = 'none';
        text.textContent = 'Bienvenue sur notre page d\'inscription';
        changemdpBtn.style.display = 'none';
        surpriseButton.style.display = 'none';
    }
}

surpriseButton.addEventListener('click', () => {
    phoenixImage.style.display = 'block';
});

// Au chargement, la session serveur décide si un utilisateur est connecté.
window.addEventListener('load', () => {
    // Supprime l'ancienne donnée utilisateur enregistrée avant l'utilisation du token.
    localStorage.removeItem('user');
    const token = localStorage.getItem('token');
    fetch('/session', { headers: { Authorization: `Bearer ${token}` } })
        .then(response => response.ok ? response.json() : null)
        .then(data => {
            const user = data ? data.user : null;
            if (!user) {
                localStorage.removeItem('token');
            }
            afficherEtatConnexion(user);
        })
        .catch(() => afficherEtatConnexion(null));
});

//fonction se déconnecter
decoBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.reload();
});

//fonction qui permet au user de supprimer son compte sauf si le compte est admin
supprBtn.addEventListener('click', () => {
    if (currentUser && currentUser.login === 'admin') {
        alert('Vous ne pouvez pas supprimer le compte admin.');
        return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
        fetch('/supprimerCompte', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
        }).then(response => response.json().then(data => ({ response, data })))
                .then(({ response, data }) => {
                alert(data.message);
                    if (response.ok) {
                        localStorage.removeItem('token');
                        window.location.reload();
                    }
            });
    }
});

// Récupère la liste puis crée une ligne et un bouton pour chaque utilisateur.
function afficherUsers() {
    fetch('/afficherUsers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(response => response.json())
        .then(data => {
            if (data.message !== 'Liste des utilisateurs récupérée avec succès !') {
                alert(data.message);
                return;
            }

            userListContainer.replaceChildren();
            userListContainer.style.display = 'block';

            const title = document.createElement('p');
            title.textContent = 'Liste des utilisateurs :';
            userListContainer.appendChild(title);

            data.user.forEach(listedUser => {
                const row = document.createElement('div');
                row.className = 'admin-user-row';

                const label = document.createElement('span');
                label.textContent = `Login: ${listedUser.login}`;

                const button = document.createElement('button');
                button.textContent = 'Supprimer';
                button.addEventListener('click', () => supprimerUser(listedUser.Id));

                row.append(label, button);
                userListContainer.appendChild(row);
            });
        })
        .catch(() => alert('Erreur lors de la récupération des utilisateurs.'));
}

// Supprime l'utilisateur choisi puis actualise la liste.
function supprimerUser(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }

    fetch('/supprimerUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id })
    }).then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Suppression réussie !') {
                afficherUsers();
            }
        })
        .catch(() => alert('Erreur lors de la suppression de l\'utilisateur.'));
}

afficherUserBtn.addEventListener('click', () => {
    if (currentUser && currentUser.login === 'admin') {
        afficherUsers();
    } else {
        alert('Vous devez être connecté en tant qu\'admin pour afficher la liste des utilisateurs.');
    }
});

//fonction qui permet de changer le mot de passe
changePasswordBtn.addEventListener('click', () => {
    const newPassword = document.getElementById('newPasswordInput').value;
    if (!newPassword) {
        alert('Veuillez entrer un nouveau mot de passe.');
        return;
    }

    fetch('/changerMotDePasse', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ newPassword })
    }).then(response => response.json())
        .then(data => {
            alert(data.message);
            if (data.message === 'Mot de passe changé avec succès !') {
                document.getElementById('newPasswordInput').value = '';
                document.getElementById('changePasswordForm').style.display = 'none';
            }
        })
        .catch(() => alert('Erreur lors du changement de mot de passe.'));
});

// Affiche le formulaire de changement de mot de passe lorsque le bouton est cliqué
document.getElementById('changemdp').addEventListener('click', () => {
    const form = document.getElementById('changePasswordForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

