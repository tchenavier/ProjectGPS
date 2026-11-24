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


//fonction inscription 
registerButton.addEventListener('click', () => {
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
    const isAdmin = user && user.name === 'admin';
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
        text.textContent = `Bienvenue ${user.name} !`;
        changemdpBtn.style.display = 'block';
        surpriseButton.style.display = 'block';
        document.getElementById('map').style.display = 'block';
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
        document.getElementById('map').style.display = 'none';

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
            if (user) {
                afficherPointsGPS();
            }
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

// Affiche les points GPS enregistrés en base de données.
function convertirCoordonneeGPS(valeur, limiteDegres) {
    if (valeur === null || valeur === '') return NaN;
    const coordonnee = Number(valeur);
    if (!Number.isFinite(coordonnee)) return NaN;
    if (Math.abs(coordonnee) <= limiteDegres) {
        return coordonnee;
    }

    const absolue = Math.abs(coordonnee);
    const degres = Math.floor(absolue / 100);
    const minutes = absolue % 100;
    const decimale = degres + minutes / 60;
    if (degres > limiteDegres || minutes >= 60 || decimale > limiteDegres) return NaN;
    return Math.sign(coordonnee) * decimale;
}

function afficherPointsGPS() {
    fetch('/recupererPoints', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(async response => {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            throw new Error(
                `Réponse non JSON reçue (${response.status}). Vérifie que le serveur Express est démarré et que la route /recupererPoints est disponible.`
            );
        }
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Erreur lors de la récupération des points GPS.');
        }
        if (!Array.isArray(data.points)) {
            throw new Error('La réponse du serveur ne contient pas de liste de points.');
        }
        return data.points;
    }).then(points => {
        pointsLayer.clearLayers();
        const coords = points.map(point => [
            convertirCoordonneeGPS(point.latitude, 90),
            convertirCoordonneeGPS(point.longitude, 180)
        ]);

        if (coords.some(([latitude, longitude]) =>
            !Number.isFinite(latitude) || !Number.isFinite(longitude)
        )) {
            throw new Error('La base de données contient des coordonnées GPS invalides.');
        }
        if (coords.length === 0) {
            return;
        }

        if (coords.length > 1) {
            L.polyline(coords).addTo(pointsLayer);
        }
        coords.forEach(coord => {
            L.marker(coord).addTo(pointsLayer);
        });
        map.fitBounds(pointsLayer.getBounds(), { padding: [20, 20], maxZoom: 16 });
    }).catch(error => {
        console.error('Erreur lors de la récupération des points GPS :', error);
        alert(error.message || 'Erreur lors de la récupération des points GPS.');
    });
}


// Affiche le formulaire de changement de mot de passe lorsque le bouton est cliqué
document.getElementById('changemdp').addEventListener('click', () => {
    const form = document.getElementById('changePasswordForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
});

const map = L.map('map').setView([49.4295, 2.0807], 11);
const pointsLayer = L.layerGroup().addTo(map);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('click', e => {
    L.popup().setLatLng(e.latlng).setContent(e.latlng.toString()).openOn(map);
});
