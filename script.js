let donnees = loadProduits(); 
let poubelle = JSON.parse(localStorage.getItem('poubelle')) || [];
const liste = document.getElementById('listeProduits');
const form = document.getElementById('form');


function refresh(){
    localStorage.clear();
}

function loadProduits() {
    const produitsStockes = localStorage.getItem('produits');
    return produitsStockes ? JSON.parse(produitsStockes) : [];
}

function saveProduits() {
    localStorage.setItem('produits', JSON.stringify(donnees));
    localStorage.setItem('poubelle', JSON.stringify(poubelle));
}

fetch('produits.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        const produitsStockes = localStorage.getItem('produits');
        if (produitsStockes) {
            donnees = JSON.parse(produitsStockes);
        } else {
            const produitsSupprimesDefinitivement = JSON.parse(localStorage.getItem('produitsSupprimesDefinitivement')) || [];
            const poubelle = JSON.parse(localStorage.getItem('poubelle')) || [];

            const produitsSansDoublon = data.filter(produit => 
                !poubelle.some(p => p && p.reference === produit.reference) && 
                !produitsSupprimesDefinitivement.some(p => p && p.reference === produit.reference)
            );

            donnees = produitsSansDoublon;
        }

        populateCategories(); 
        afficherProduits(); 
        generateProductModals(); 
    })
    .catch(function(error) {
        console.error("Erreur lors du chargement du fichier JSON : ", error);
    });





function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach(error => error.innerText = "");
    window.errorCount = 0;
}

function validateField(value, condition, errorElement, errorMessage) {
    if (condition(value)) {
        errorElement.innerText = errorMessage;
        window.errorCount++;
    } else {
        errorElement.innerText = "";
    }
}

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


function afficherPoubelle() {
    let poubelle = JSON.parse(localStorage.getItem('poubelle')) || [];

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
            <td><button onClick="restaurer('${produit.reference}')"><img src="assets/images/icons/restore.png" alt="Restore icon"></button></td>
            <td><button onClick="supprimerDefinitivement('${produit.reference}')"><img src="assets/images/icons/trash.png" alt="Trash icon"></button></td>
        `;

        tr.innerHTML = contenu;
        trashTableBody.appendChild(tr);
    });
}

function populateCategories() {
    const categories = Array.from(new Set(donnees.map(produit => produit.categorie)));
    const categorieSelect = document.getElementById('categorie');

    categorieSelect.innerHTML = '<option value="">-- Sélectionner une catégorie --</option>';

    categories.forEach(categorie => {
        let option = document.createElement('option');
        option.value = categorie;
        option.textContent = categorie;
        categorieSelect.appendChild(option);
    });

    categorieSelect.dispatchEvent(new Event('change'));
}


document.getElementById('categorie').addEventListener('change', function() {
    const selectedCategory = this.value;
    const referenceInput = document.getElementById('reference');

    // Trouver le premier produit de la catégorie sélectionnée
    const produit = donnees.find(p => p.categorie === selectedCategory);
    
    if (produit) {
        referenceInput.value = produit.reference.substring(0, 3).toUpperCase(); 
    } else {
        referenceInput.value = ''; // Réinitialiser si pas de produit
    }
});

let modal = document.getElementById("addProductModal");
let trash = document.getElementById("trashModal"); 
let trashButton = document.getElementById("trashButton");
let addButton = document.getElementById("addButton");
let closeButton = document.getElementById("closeButton");
let closeTrashButton = document.getElementById("closeTrashButton");


addButton.onclick = function() {
    modal.style.display = "block";
    form.reset();
    document.getElementById('categorie').value = ""; // Remet la catégorie à l'option par défaut
    document.getElementById('reference').value = ""; // Vider la référence aussi
    document.getElementById('categorie').dispatchEvent(new Event('change')); // Forcer le changement
};


trashButton.onclick = function() {
    trash.style.display = "block";
    afficherPoubelle(); 
};

closeTrashButton.onclick = function() {
    trash.style.display = "none";
};

closeButton.onclick = function() {
    modal.style.display = "none";
    form.reset();
};

form.addEventListener('submit', function(event) {
    event.preventDefault();
    clearErrors(); 

    let reference = document.getElementById('reference').value.trim()
    let libelle = document.getElementById('libelle').value.trim();
    let description = document.getElementById('description').value.trim();
    let prix = document.getElementById('prix').value.replace(/[^\d.]/g, '').trim();
    let categorie = document.getElementById('categorie').value;
    let photo = document.getElementById('photo').value.trim();
    let stock = document.getElementById('stock').checked;
    let referenceError = document.getElementById("error-reference");
    let libelleError = document.getElementById("error-libelle");
    let prixError = document.getElementById("error-prix");
    let photoError = document.getElementById("error-photo");
    let descriptionError = document.getElementById("error-description");
    let categorieError = document.getElementById("error-categorie");



    const regexReference = /^[A-Z]{3}\d{3,}$/;
    const regexPrix = /^\d+\.\d{2}$/;
    const regexPhoto = /^[a-zA-Z0-9_-]+(?:\d+)?\.(jpg|jpeg|png|gif|bmp|webp)$/;

    validateField(categorie, val => val === "", categorieError, "Veuillez sélectionner une catégorie");
    validateField(reference, val => !regexReference.test(val), referenceError, "Référence invalide (6-10 caractères)");
    validateField(libelle, val => val.length < 15 || val.length > 100, libelleError, "Libellé invalide (15-100 caractères)");
    validateField(prix, val => !regexPrix.test(val), prixError, "Prix invalide au moins deux chiffre apres la virgule plus devise");
    validateField(photo, val => !regexPhoto.test(val), photoError, "Photo invalide (mettre le .png ou autre)");
    validateField(description, val => val.length < 15 || val.length > 200, descriptionError, "Description invalide (15-200 caractères)");

    if (window.errorCount > 0) {
        result.innerHTML = `<p>Il reste des erreurs</p>`;
        return; 
    } else {
        let produitExistant = donnees.find(p => p.reference === reference);

        if (produitExistant) {
            produitExistant.libelle = libelle;
            produitExistant.description = description;
            produitExistant.prix = prix;
            produitExistant.categorie = categorie;
            produitExistant.photo = photo;
            produitExistant.stock = stock;
            saveProduits();
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
            saveProduits();
        }

        form.reset();
        document.getElementById('reference').value = "";
        modal.style.display = "none";
        afficherProduits();
        generateProductModals();
    }
});

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

function supprimer(reference) {
    let produitSupprime = donnees.find(p => p.reference === reference);
    if (produitSupprime) {
        donnees = donnees.filter(produit => produit.reference !== reference);
        poubelle.push(produitSupprime);
        saveProduits(); 
        afficherProduits();
        generateProductModals();
    }
}

function restaurer(reference) {
    let produitRestauré = poubelle.find(p => p.reference === reference);
    if (produitRestauré) {
        poubelle = poubelle.filter(produit => produit.reference !== reference);
        donnees.push(produitRestauré);
        saveProduits(); 
        afficherProduits();
        afficherPoubelle(); 
        generateProductModals();
    }
}

function supprimerDefinitivement(reference) {
    let poubelle = JSON.parse(localStorage.getItem('poubelle')) || [];
    let produitsSupprimesDefinitivement = JSON.parse(localStorage.getItem('produitsSupprimesDefinitivement')) || [];
    
    const produitIndex = poubelle.findIndex(produit => produit.reference === reference);
    
    if (produitIndex === -1) {
        console.error('Produit non trouvé dans la poubelle');
        return;
    }

    const produitSupprime = poubelle[produitIndex];
    produitsSupprimesDefinitivement.push(produitSupprime);
    localStorage.setItem('produitsSupprimesDefinitivement', JSON.stringify(produitsSupprimesDefinitivement));
    poubelle = poubelle.filter(produit => produit.reference !== reference);
    localStorage.setItem('poubelle', JSON.stringify(poubelle));

    afficherPoubelle();
}

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

function voir(reference) {
    const modal = document.getElementById(`productModal-${reference}`);
    if (modal) {
        modal.style.display = "block";
    }
}
