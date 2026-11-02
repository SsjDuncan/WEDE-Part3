document.addEventListener('DOMContentLoaded', () => {
    
    /* ==========================================
       1. INTERACTIVE MAPS (LEAFLET.JS API)
       ========================================== */
    const mapCont1 = document.getElementById('mapKarakura');
    const mapCont2 = document.getElementById('mapSeireitei');

    if (mapCont1 || mapCont2) {
        if (!window.L) {
            console.error('Map containers are present, but Leaflet.js is not loaded.');
        } else {
            const latKarakura = -26.1765, lngKarakura = 28.0360;
            const latSeireitei = -26.1795, lngSeireitei = 28.0395;
            const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
            const attr = '&copy; OpenStreetMap contributors';

            [
                { element: mapCont1, id: 'mapKarakura', coordinates: [latKarakura, lngKarakura], label: 'Karakura Central Shop' },
                { element: mapCont2, id: 'mapSeireitei', coordinates: [latSeireitei, lngSeireitei], label: 'Soul District Hub' }
            ].forEach(({ element, id, coordinates, label }) => {
                if (!element) return;

                const map = window.L.map(id, { scrollWheelZoom: false }).setView(coordinates, 15);
                window.L.tileLayer(tileUrl, { attribution: attr }).addTo(map);
                window.L.marker(coordinates).addTo(map).bindPopup(`<strong>${label}</strong>`).openPopup();
            });
        }
    }

    /* ==========================================
       2. FAIL-SAFE LIVE SEARCH & CATEGORY FILTER ENGINE
       ========================================= */
    const searchInput = document.getElementById('productSearch');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    function executeMasterFilter() {
        const activeButton = document.querySelector('.filter-btn.active');
        const currentCategory = activeButton ? activeButton.getAttribute('data-category') : 'all';
        const currentSearchText = searchInput ? searchInput.value.toLowerCase().trim() : '';

        productCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const cardKeywords = `${card.getAttribute('data-title') || ''} ${card.textContent}`.toLowerCase();

            const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
            const matchesSearch = cardKeywords.includes(currentSearchText);

            if (matchesCategory && matchesSearch) {
                card.style.setProperty('display', 'flex', 'important');
            } else {
                card.style.setProperty('display', 'none', 'important');
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            executeMasterFilter();
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            executeMasterFilter();
        });
    });

    /* ==========================================
       3. IMAGES LIGHTBOX GALLERY (WHOLE CARD CLICK)
       ========================================== */
    const lightboxOverlay = document.getElementById('lightboxOverlay');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');

    productCards.forEach(card => {
        card.style.cursor = 'pointer';
        
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, input, textarea, select, a')) return;

            const cardImg = card.querySelector('img');
            const cardHeading = card.querySelector('h3');

            if (lightboxOverlay && lightboxImage && cardImg) {
                lightboxOverlay.style.display = 'flex';
                lightboxOverlay.setAttribute('aria-hidden', 'false');
                lightboxImage.src = cardImg.src;
                
                if (cardHeading && lightboxCaption) {
                    lightboxCaption.innerText = cardHeading.innerText;
                }
            }
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target === lightboxOverlay) hideLightbox();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') hideLightbox();
    });

    function hideLightbox() {
        if (lightboxOverlay) {
            lightboxOverlay.style.display = 'none';
            lightboxOverlay.setAttribute('aria-hidden', 'true');
        }
    }

    /* ==========================================
       4. CLIENT-SIDE FORM VALIDATION
       ========================================== */
    const requestForm = document.getElementById('requestForm');

    if (requestForm) {
        requestForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const fullName = document.getElementById('fullName').value.trim();
            const productName = document.getElementById('productName').value.trim();

            if (fullName.length < 3) {
                alert("⚠️ Error: Full Name must be at least 3 characters long.");
                return;
            }

            displayThemedAlert(fullName, productName);
            requestForm.reset();
        });
    }

    function displayThemedAlert(user, product) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0'; modal.style.left = '0'; modal.style.width = '100%'; modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)'; modal.style.display = 'flex';
        modal.style.justifyContent = 'center'; modal.style.alignItems = 'center'; modal.style.zIndex = '99999';
        modal.style.backdropFilter = 'blur(4px)';

        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 6px; max-width: 400px; width: 90%; text-align: center; border-top: 5px solid #e65c00; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                <h3 style="font-family: 'Courier New', monospace; color: #1a1a1a;">TRANSMISSION SENT!</h3>
                <p id="requestConfirmation" style="margin: 1rem 0; font-size: 14px; color: #555;"></p>
                <button id="closeAlertBtn" class="btn btn-primary" style="width:100%; background: #e65c00; color: white; padding: 0.75rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Return to Vault</button>
            </div>
        `;
        modal.querySelector('#requestConfirmation').textContent =
            `Greetings ${user}, your custom request for "${product}" has successfully bypassed the Senkaimon barrier!`;
        document.body.appendChild(modal);
        document.getElementById('closeAlertBtn').addEventListener('click', () => modal.remove());
    }

    /* ==========================================
       5. USER AUTHENTICATION & LOGIN LOGIC
       ========================================== */
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const userEmail = document.getElementById('loginEmail').value.trim();
            const userPass = document.getElementById('loginPassword').value;

            if (userPass.length < 6) {
                alert("⚠️ Access Denied: Spiritual Passkey entries require a 6 character minimum length.");
                return;
            }

            const authModal = document.createElement('div');
            authModal.style.position = 'fixed';
            authModal.style.top = '0'; authModal.style.left = '0'; authModal.style.width = '100%'; authModal.style.height = '100%';
            authModal.style.backgroundColor = 'rgba(0,0,0,0.8)'; authModal.style.display = 'flex';
            authModal.style.justifyContent = 'center'; authModal.style.alignItems = 'center'; authModal.style.zIndex = '99999';
            authModal.style.backdropFilter = 'blur(4px)';

            authModal.innerHTML = `
                <div style="background: white; padding: 2rem; border-radius: 6px; max-width: 400px; width: 90%; text-align: center; border-top: 5px solid #2b8a3e; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                    <h3 style="font-family: 'Courier New', monospace; color: #2b8a3e;">⚡ ACCESS GRANTED ⚡</h3>
                    <p style="margin: 1rem 0; font-size: 14px; color: #555;">Welcome back, Guardian! Access credentials for <strong id="authEmail"></strong> verified successfully.</p>
                    <button id="closeAuthBtn" class="btn btn-primary" style="width:100%; background: #2b8a3e; color: white; padding: 0.75rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Enter Portal</button>
                </div>
            `;
            authModal.querySelector('#authEmail').textContent = userEmail;
            document.body.appendChild(authModal);
            document.getElementById('closeAuthBtn').addEventListener('click', () => authModal.remove());
            loginForm.reset();
        });
    }

    const registerForm = document.getElementById('registerForm');
    const showRegisterForm = document.getElementById('showRegisterForm');
    const showLoginForm = document.getElementById('showLoginForm');
    const forgotPasscodeForm = document.getElementById('forgotPasscodeForm');

    if (loginForm && registerForm && showRegisterForm && showLoginForm) {
        showRegisterForm.addEventListener('click', () => {
            loginForm.hidden = true;
            registerForm.hidden = false;
            if (forgotPasscodeForm) forgotPasscodeForm.hidden = true;
            document.getElementById('registerName').focus();
        });

        showLoginForm.addEventListener('click', () => {
            registerForm.hidden = true;
            loginForm.hidden = false;
            document.getElementById('loginEmail').focus();
        });

        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const name = document.getElementById('registerName').value.trim();
            const email = document.getElementById('registerEmail').value.trim();
            const loginEmail = document.getElementById('loginEmail');

            loginEmail.value = email;
            registerForm.reset();
            registerForm.hidden = true;
            loginForm.hidden = false;

            const overlay = document.createElement('div');
            overlay.className = 'registration-success-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-labelledby', 'registrationSuccessTitle');

            const card = document.createElement('div');
            card.className = 'registration-success-card';
            card.innerHTML = `
                <span class="registration-success-icon" aria-hidden="true">✓</span>
                <h3 id="registrationSuccessTitle">Welcome to the Vault!</h3>
                <p class="form-status"></p>
                <p class="form-status">This is a demo only; no account or password has been saved.</p>
                <button type="button" class="btn btn-primary">Return to Login</button>
            `;
            card.querySelectorAll('.form-status')[0].textContent =
                `Your demo sign-up is complete, ${name}.`;

            const closeButton = card.querySelector('button');
            closeButton.addEventListener('click', () => {
                overlay.remove();
                loginEmail.focus();
            });

            overlay.appendChild(card);
            document.body.appendChild(overlay);
            closeButton.focus();
        });
    }

    const forgotPasscodeButton = document.getElementById('forgotPasscodeButton');
    const recoveryEmail = document.getElementById('recoveryEmail');
    const recoveryStatus = document.getElementById('recoveryStatus');

    if (forgotPasscodeButton && forgotPasscodeForm && recoveryEmail && recoveryStatus) {
        forgotPasscodeButton.addEventListener('click', () => {
            forgotPasscodeForm.hidden = !forgotPasscodeForm.hidden;
            if (!forgotPasscodeForm.hidden) {
                recoveryEmail.focus();
            }
        });

        forgotPasscodeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            recoveryStatus.textContent =
                'This demo cannot send password-reset emails. Contact the site administrator to verify your account and reset your passcode.';
        });
    }

    /* ==========================================
       6. DYNAMIC NAVIGATION ACTIVE SCROLL TRACKER (NEW FIX)
       ========================================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const scrollOptions = {
        root: null,
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
    };

    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const activeId = entry.target.id;

                    navLinks.forEach(link => {
                        const linkTarget = link.getAttribute('href');
                        link.classList.toggle('active', linkTarget === `#${activeId}`);
                    });
                }
            });
        }, scrollOptions);

        sections.forEach(section => scrollObserver.observe(section));
    }
});