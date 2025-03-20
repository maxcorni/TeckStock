let donnees = [];
let poubelle = [];
const liste = document.getElementById('listeProduits');
const form = document.getElementById('form');

// Charger les données JSON
fetch('produits.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        donnees = data;
        populateCategories(); // Remplir les catégories dans le formulaire
        afficherProduits(); // Afficher les produits
        generateProductModals();
    })
    .catch(function(error) {
        console.error("Erreur lors du chargement du fichier JSON : ", error);
    });

// Afficher les produits dans le tableau principal
function afficherProduits() {
    liste.innerHTML = "";
    donnees.forEach((produit) => {
        let tr = document.createElement("tr");

        let contenu = `
            <td>${produit.reference}</td>
            <td>${produit.categorie}</td>
            <td>${produit.libelle}</td>
            <td>${produit.prix}€</td>
            <td><img src="assets/images/icons/${produit.stock > 0 ? 'green-circle.png' : 'red-circle.png'}" alt="Stock icon"></td>
            <td><button onClick="voir('${produit.reference}')"><img src="assets/images/icons/eye.png" alt="Eye icon"></button></td>
            <td><button onClick="modifier('${produit.reference}')"><img src="assets/images/icons/edit.png" alt="Edit icon"></button></td>
            <td><button onClick="supprimer('${produit.reference}')"><img src="assets/images/icons/trash.png" alt="Delete icon"></button></td>
        `;

        tr.innerHTML = contenu;
        liste.appendChild(tr);
    });
}

// Afficher les produits supprimés dans la modale poubelle
function afficherPoubelle() {
    const trashTableBody = document.querySelector('#trashModal tbody');
    trashTableBody.innerHTML = "";

    poubelle.forEach((produit) => {
        let tr = document.createElement("tr");

        let contenu = `
            <td>${produit.reference}</td>
            <td>${produit.categorie}</td>
            <td>${produit.libelle}</td>
            <td>${produit.prix}€</td>
            <td><img src="assets/images/icons/${produit.stock > 0 ? 'green-circle.png' : 'red-circle.png'}" alt="Stock icon"></td>
            <td><button onClick="restaurer('${produit.reference}')"><img src="assets/images/icons/green-circle.png" alt="Restore icon"></button></td>
        `;

        tr.innerHTML = contenu;
        trashTableBody.appendChild(tr);
    });
}

// Remplir les catégories dans le formulaire d'ajout
function populateCategories() {
    const categories = Array.from(new Set(donnees.map(produit => produit.categorie)));
    const categorieSelect = document.getElementById('categorie');
    categorieSelect.innerHTML = `<option value="">Choisir la catégorie</option>`;
    categories.forEach(categorie => {
        let option = document.createElement('option');
        option.value = categorie;
        option.textContent = categorie;
        categorieSelect.appendChild(option);
    });
}

// Gérer les modales
let modal = document.getElementById("addProductModal");
let trash = document.getElementById("trashModal"); 
let trashButton = document.getElementById("trashButton");
let addButton = document.getElementById("addButton");
let closeButton = document.getElementById("closeButton");
let closeTrashButton = document.getElementById("closeTrashButton");


// Ouvrir la modale d'ajout
addButton.onclick = function() {
    modal.style.display = "block";
};

trashButton.onclick = function() {
    trash.style.display = "block";
    afficherPoubelle(); 
};

// Fermer les modales
closeTrashButton.onclick = function() {
    trash.style.display = "none";
};

// Fermer les modales
closeButton.onclick = function() {
    modal.style.display = "none";
    form.reset();
};

// Formulaire d'ajout ou modification
form.addEventListener('submit', function(event) {
    event.preventDefault();

    let reference = document.getElementById('reference').value;
    let libelle = document.getElementById('libelle').value;
    let description = document.getElementById('description').value;
    let prix = document.getElementById('prix').value;
    let categorie = document.getElementById('categorie').value;
    let photo = document.getElementById('photo').value;
    let stock = document.getElementById('stock').checked;

    let produitExistant = donnees.find(p => p.reference === reference);

    if (produitExistant) {
        produitExistant.libelle = libelle;
        produitExistant.description = description;
        produitExistant.prix = prix;
        produitExistant.categorie = categorie;
        produitExistant.photo = photo;
        produitExistant.stock = stock;
        console.log("Produit modifié :", produitExistant);
    } else {
        let nouveauProduit = {
            reference,
            libelle,
            description,
            prix,
            categorie,
            photo,
            stock
        };
        donnees.push(nouveauProduit);
        console.log("Nouveau produit ajouté :", nouveauProduit);
    }

    form.reset();
    document.getElementById('reference').value = "";
    modal.style.display = "none";
    afficherProduits();
    generateProductModals();
});

// Modifier un produit
function modifier(reference) {
    let produit = donnees.find(p => p.reference === reference);
    if (produit) {
        document.getElementById('reference').value = produit.reference;
        document.getElementById('libelle').value = produit.libelle;
        document.getElementById('description').value = produit.description;
        document.getElementById('prix').value = produit.prix;
        document.getElementById('categorie').value = produit.categorie;
        document.getElementById('photo').value = produit.photo;
        document.getElementById('stock').checked = produit.stock > 0;

        modal.style.display = "block";
    }
}

// Supprimer un produit (l'envoyer à la poubelle)
function supprimer(reference) {
    let produitSupprime = donnees.find(p => p.reference === reference);
    if (produitSupprime) {
        donnees = donnees.filter(produit => produit.reference !== reference);
        poubelle.push(produitSupprime);
        afficherProduits();
        generateProductModals();
    }
}

// Restaurer un produit depuis la poubelle
function restaurer(reference) {
    let produitRestauré = poubelle.find(p => p.reference === reference);
    if (produitRestauré) {
        poubelle = poubelle.filter(produit => produit.reference !== reference);
        donnees.push(produitRestauré);
        afficherProduits();
        afficherPoubelle(); // Refresh la vue de la poubelle après restauration
        generateProductModals();
    }
}

// Générer toutes les modales de détail produit
function generateProductModals() {
    const existingModals = document.querySelectorAll('.product-modal');
    existingModals.forEach(modal => modal.remove());

    donnees.forEach(produit => {
        let modal = document.createElement('div');
        modal.id = `productModal-${produit.reference}`;
        modal.className = 'modal product-modal';

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Détail du produit</h2>
                    <button class="secondary-btn close-btn" data-ref="${produit.reference}">
                        <img src="assets/images/icons/back-arrow.png" alt="back icon">Retour
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col">	
                            <img src="imagesProduits/${produit.photo}" alt="${produit.libelle}" class="img-produit">
                        </div>	
                        <div class="col">
                            <div class="row">
                                <p><strong>${produit.libelle}</strong></p>
                                <img src="assets/images/icons/${produit.stock > 0 ? 'green-circle.png' : 'red-circle.png'}" alt="Stock icon">
                            </div>
                            <div class="row">
                                <p><strong>Référence :</strong> ${produit.reference}</p>
                                <p><strong>${produit.prix} €</strong></p>
                            </div>
                            <p>${produit.categorie}</p>
                            <p>${produit.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        };
    });
}

// Fonction pour ouvrir la modale spécifique d'un produit
function voir(reference) {
    const modal = document.getElementById(`productModal-${reference}`);
    if (modal) {
        modal.style.display = "block";
    }
}
















