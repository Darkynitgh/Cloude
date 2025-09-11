const setLoader = (action = 'show') => {
    try {
        const a = document.querySelectorAll('.cargando-c')
        if (action === 'show') {
            a.forEach(key => {
                key.style.display = 'block'
            })
        } else {
            a.forEach(key => {
                key.style.display = 'none'
            })
        }
    } catch (e) {
        console.error('ERROR LOADER\n', e)
    }
}


let url;
if (document.location.port == "") {
    url = document.location.protocol + "//" + document.location.hostname + "/redoselpublico/";
} else {
    url = document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/";
}

let carousel = false;


const mainApp = Vue.createApp({
    data() {
        return {
            nombre: '',
            apellidos: '',
            nombre_corto: '',
            apellidos_corto: '',
            perfil: '',
            idUsuario: 0,
            idPerfil: 0,
            auxSage: '',
            array: {
                menu: [],
                completo: [],
                recursos: []
            },
            opcionesGenerales: null
        }
    },
    methods: {
        async salir() {
            let res = await alerts.confirm(`<p class="p-0 m-0 text-center">¿Está seguro de cerrar sesión</p>`);
            if (res) {
                setLoader();
                axios.post(`${url}Seguridad/Salir`, {}).then(_ => {
                    sessionStorage.removeItem('tok_RedOselDistribuidores');
                    setTimeout(a => {
                        document.location.assign(`${url}`);
                    }, 50);
                }).catch(_ => {
                    alerts.error('Hubo un error al cerrar la sesión, intente de nuevo');
                })               
            }
        },
        // Function to refresh the token
        async refreshAccessToken() {
            try {

                const response = await axios.post(`${url}Seguridad/Rsh`, {}, {
                    skipAuth: true, // Custom property to skip the interceptor
                });
                const ds = response.data;

                if (ds.hasOwnProperty('token')) {
                    // Save the new access token
                    sessionStorage.setItem('tok_RedOselDistribuidores', ds.token);
                    this.intentos++;
                    return true;
                }
    
                return false;              
            } catch (error) {
                alerts.info('Sesión terminada');
                setTimeout(a => {
                    window.location.href = url; // Redirect to root if refresh fails
                }, 1000)
                return;
            }
        },
        // Initialize Axios interceptors
        initializeAxiosInterceptors() {
            axios.interceptors.request.use(
                (config) => {
                    let token = sessionStorage.getItem('tok_RedOselDistribuidores') ?? '';

                    if (!config.hasOwnProperty('skipAuth')) {
                        config.skipAuth = false;
                    }

                    if (!config.skipAuth && token && config.method === 'post') {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                    return config;
                },
                (error) => Promise.reject(error)
            );

            axios.interceptors.response.use(
                (response) => response, // Return successful responses
                async (error) => {
                    const originalRequest = error.config;

                    // Handle 401 Unauthorized
                    if (error.isAxiosError && error.code ==='ERR_NETWORK' || error.response && error.response.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true; // Mark as retried
                        try {
                            if (await this.refreshAccessToken()) {
                                // Refresh the token
                                originalRequest.headers.Authorization = `Bearer ${sessionStorage.getItem('tok_RedOselDistribuidores')}`; // Update the request with the new token
                                return axios(originalRequest); // Retry the original request
                            } else {
                                throw new Error();
                            }
                        } catch (refreshError) {
                            alerts.info('Sesión terminada');
                            setTimeout(a => {
                                window.location.href = url; // Redirect to root if refresh fails
                            }, 1000)
                        }
                    }
                    return Promise.reject(error); // Reject other errors
                }
            );                                                  
        },
        validaAcceso() {
            return new Promise((success, fail) => {
                setLoader();
                axios.post(url + 'Seguridad/ValidateJwt', {}).then(result => {
                    var ds = result.data;

                    this.nombre = ds.Name;
                    this.apellidos = ds.Surname;
                    this.nombre_corto = ds.Name?.substring(0,10) || "";
                    this.apellidos_corto = ds.Surname?.substring(0,10) || "";
                    this.perfil = ds.Role;
                    this.idUsuario = ds.UserData;
                    this.idPerfil = ds.IdPerfil;
                    this.auxSage = ds.AuxSage;

                    setLoader('hide');
                    success(result);
                }).catch(err => {
                    fail(err);
                })
            })
        },
        validaC() {
            axios.post(`${url}Seguridad/VerificaC`, {})
                .then(res => {
                    if (res.data.token !== '') {
                        alert('La contraseña actual requiere ser actualizada por políticas de Pinturas Osel.\nSerá redireccionado a la página de actualización.');
                        sessionStorage.setItem('actualiza', true);
                        sessionStorage.setItem('correo', res.data.correoElectronico);
                        setLoader();
                        document.location.assign(`${url}Recuperacion?token=${res.data.token}`);
                    }                 
                }).catch(err => {
                    validError(err);
                })
        },
        getMenu() {
            return new Promise((success, fail) => {
                setLoader();
                axios.post(url + 'Seguridad/GetMenu', {}).then(response => {

            

                    let dt = JSON.parse(response.data.res);
                    this.array.completo = JSON.parse(response.data.result);

                    
                    let hijos = [];

                    dt = dt.map(i => {
                        return {
                            ...i,
                            href: `${url}${i.controller}/${i.pagina}`,
                            opciones: i?.opciones?.map(j => {
                                return {
                                    ...j,
                                    href: `${url}${j.controller}/${j.pagina}`
                                }
                            }),
                            src: (i.img_descripcion ?? '') !== '' ? `${url}images/${i.img_descripcion}` : null
                        }
                    })

                    dt.forEach(i => {
                        if (i.opciones.length > 0) {
                            hijos = [...i.opciones];
                        }
                    })

                    let opcionesGenerales = [];

                    let opcionesPrincipales = [61, 62, 63, 84, 57, 117];

                    opcionesGenerales = dt.filter(i => opcionesPrincipales.includes(i.id));
                    this.array.recursos = dt.filter(i => !opcionesPrincipales.includes(i.id));

                    var item = this.array.recursos.find(i => i.id === 92);
                    if ((this.auxSage ?? '').trim() === '' && typeof item === 'object') {
                        this.array.recursos = this.array.recursos.filter(i => i.id !== 92);
                    }
                                        
                    this.array.menu = opcionesGenerales.sort((a, b) => {
                        return a.orden - b.orden;
                    });

                    setLoader('hide');
                    success('');
                }).catch(err => {
                    validError(err);
                    fail(err);
                });
            })          
        },  
        setBanner(idOpcion, idBanner, idDivBanner) {
            try {
                var item = this.array.completo.find(i => i.id_opcion === idOpcion);

                if (item) {
                    let src = `${url}images/${item.banner_pagina}`;

                    document.getElementById(idBanner).src = src;
                    document.getElementById(idDivBanner).classList.remove('d-none');
                }               
            } catch (e) {
                //
            }

            var item = this.array.completo.find(i => i.id_opcion === idOpcion);

            if (item) {
                let src = `${url}imagenes/fondos/${item.banner_pagina}`;

                document.getElementById(idBanner).setAttribute('style', `background-image:url(${src}) !important`);
            }
        },
        async logonPresupuestoPublicidad() {
            try {
                const res = await axios.get(url + 'RedOsel/PresupuestoPublicidad');
                const logonUrl = res.data.logonUrl;
                window.open(logonUrl, '_blank')
            }
            catch (err) {
                validError(err);
            }

        }

    },
    created() {
        this.initializeAxiosInterceptors();
        this.validaC();
    },
    mounted() {
        this.validaAcceso().then(response => {
           
            this.getMenu();
        }).catch(err => validError(err));        
    }
}).mount('#appLayout');





function validError(error) {
    if (!error.hasOwnProperty('response')) {
        setLoader('hide');
        console.error(error);
        alerts.error(error);
        return;
    }

    if (error.response.status === 401 || error.response.status === 403)  {
        setLoader('hide');
        alerts.info('Sesión Terminada');
        setTimeout(() => {
            document.location.href = url;
        }, 1000);
        return;
    }

    if (error.hasOwnProperty('isAxiosError')) {
        let errorMessage = error.request?.responseText ?? error.message;
        console.error(errorMessage);
        alerts.error('Error', errorMessage);
    } else {
        console.error(error);
        var msj = typeof error.response.data === 'string' ? error.response.data: error.message;
        alerts.error('Error', msj);
    }
    setLoader('hide');
}

luxon.Settings.defaultLocale = 'es';



const startToolTips = () => {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
};

function sortObjectsByString(array, key, asc = true, split = false, index = 0, splitChar = ' ') {
    if (typeof array !== 'object') {
        alert('"array" debe ser tipo Array')
        throw Error('"array" debe ser tipo Array')
    }
    if (typeof key !== 'string') {
        alert('"key" debe ser tipo String')
        throw Error('"key" debe ser tipo String')
    }

    if (typeof asc !== 'boolean') {
        alert('"asc" debe ser tipo Boolean')
        throw Error('"asc" debe ser tipo Boolean')
    }

    if (split) {
        return array.sort((a, b) => {
            let newA = a[key]?.trim().replace(/' '/g, '')?.split(splitChar)[index] ?? '';
            let newB = b[key]?.trim().replace(/' '/g, '')?.split(splitChar)[index] ?? '';
            if (asc) {
                return newB.toLocaleLowerCase().trim().localeCompare(newA.toLocaleLowerCase().trim());
            } else {
                return newA.toLocaleLowerCase().trim().localeCompare(newB.toLocaleLowerCase().trim());
            }
        });
    } else {
        return array.sort((a, b) => {
            let newA = a[key] ?? '';
            let newB = b[key] ?? '';
            if (asc) {
                return newB.toLocaleLowerCase().trim().localeCompare(newA.toLocaleLowerCase().trim());
            } else {
                return newA.toLocaleLowerCase().trim().localeCompare(newB.toLocaleLowerCase().trim());
            }
        });
    }

}



window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        window.location.reload();
    }
});