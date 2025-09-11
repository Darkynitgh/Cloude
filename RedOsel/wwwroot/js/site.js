


let url = "";


if (document.location.port == "") {
    url = document.location.protocol + "//" + document.location.hostname + "/redosel/";
} else {
    url = document.location.protocol + "//" + document.location.hostname + ":" + document.location.port + "/";
}


const mainApp = Vue.createApp({
    data() {
        return {
            usuario: '',
            perfil: '',
            idUsuario: 0,
            idPerfil: 0,
            array: {
                menu: []
            },
            apiBaseUrl: url,
            intentos: 0
        }
    },
    methods: {
        // Function to refresh the token
        async refreshAccessToken() {
            try {
                const response = await axios.post(`${url}Administracion/Rsh`, {}, {
                    skipAuth: true, // Custom property to skip the interceptor
                });
                const ds = response.data;

                // Save the new access token
                sessionStorage.setItem('tokRedOsel', ds.token);

                this.intentos++;
                return true;
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
                    let token = sessionStorage.getItem('tokRedOsel') ?? '';

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
                    if (error.isAxiosError && error.code === 'ERR_NETWORK' || error.response && error.response.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true; // Mark as retried
                        try {
                            if (await this.refreshAccessToken()) {
                                // Refresh the token
                                this.intentos = 0;
                                originalRequest.headers.Authorization = `Bearer ${sessionStorage.getItem('tokRedOsel')}`; // Update the request with the new token
                                return axios(originalRequest); // Retry the original request
                            }
                        } catch (refreshError) {
                            alerts.info('Sesión terminada');
                            setTimeout(a => {
                                window.location.href = url; // Redirect to root if refresh fails
                                //return Promise.reject(error); // Reject other errors
                            }, 1000)               
                        }
                    }

                    return Promise.reject(error); // Reject other errors
                }
            );
        },
        validaAcceso() {
            return new Promise((success, fail) => {
                $('.cargando-c').show();
                axios.post(url + 'Administracion/ValidateJwt', null, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(result => {
                    var ds = result.data;

                    this.usuario = ds.Name;
                    this.perfil = ds.Role;
                    this.idUsuario = ds.UserData;
                    this.idPerfil = ds.IdPerfil;

                    success(result);
                }).catch(err => {
                    validError(err);
                    fail(err);
                }) 
            })
        },
        getMenu() {
            axios.post(url + 'Administracion/GetMenu', null, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(response => {
                let dt = response.data;

                this.array.menu = dt;
                $(".cargando-c").hide();
            }).catch(err => validError(err));
        },
        activaMenu(opcion) {
            $('#sidebar').removeClass('active')
            if (opcion == 0) {
                $("#Submenu_1").removeClass("show")
                $("#Submenu_2").removeClass("show")
            } else if (opcion == 1) {
                $("#Submenu_0").removeClass("show")
                $("#Submenu_2").removeClass("show")
            } else {
                $("#Submenu_0").removeClass("show")
                $("#Submenu_1").removeClass("show")
            }
        },
        desactivaMenu() {
            $('#sidebar').addClass('active')
            setTimeout(function () {
                $("#Submenu_0").removeClass("show")
                $("#Submenu_1").removeClass("show")
                $("#Submenu_2").removeClass("show")
            }, 500);  
        },
        async irAMenu(controller, action) {
            if (action !== 'LogOut') {
                $('.cargando-c').show();
                document.location.assign(url + controller + '/' + action);
            } else {
                let res = await alerts.confirm('¿Está seguro de cerrar sesión?');
                if (res) {
                    $('.cargando-c').show();
                    sessionStorage.clear();
                    document.location.assign(url);
                }
            }
        }
    },
    created() {
        this.initializeAxiosInterceptors();
    },
    mounted() {
        this.validaAcceso().then(response => {
            this.getMenu();
        });
    }
}).mount('#appLayout');



const validError = (error) => {
    if (!error.hasOwnProperty('response')) {
        $('.cargando-c').hide();
        console.error(error);
        alerts.error(error);
        return;
    }

    if (error.response.status === 401 || error.response.status === 403) {
        $('.cargando-c').hide();
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
        alerts.error('Error', error.response.data ?? error.message);
    }
    $('.cargando-c').hide();
}



(function () {
    window.eval = function () {
        throw new Error("Uso of \"eval()\" está prohibido.");
        return;
    };
})();



const Salir = async () => {
    let res = await alerts.confirm('¿Está seguro de cerrar sesión?');
    if (res) {
        $('.cargando-c').show();
        document.location.assign(url);
    }
}



$(document).on('shown.bs.modal', '.modal', function(event) {
    var zIndex = 1040 + (10 * $('.modal:visible').length);
    $(this).css('z-index', zIndex);
    setTimeout(function () {
        $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
    }, 0);
});


// Prevent bootstrap dialog from blocking focusin
document.addEventListener('focusin', (e) => {
    if (e.target.closest('.tox-tinymce-aux, .moxman-window, .tam-assetmanager-root') !== null) {
        e.stopImmediatePropagation();
    }
});



$(document).on('focusin', (e) => {
    if ($(e.target).closest(" .tox-dialog").length) {
        e.stopImmediatePropagation();
    }
});
    

$(function() {
    flatpickr(".flatpickr-date", {
        dateFormat: "d/m/Y",
        weekNumbers: true,
        allowInput: true,
        locale: {
            weekdays: {
                shorthand: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
                longhand: [
                    "Domingo",
                    "Lunes",
                    "Martes",
                    "Miércoles",
                    "Jueves",
                    "Viernes",
                    "Sábado",
                ],
            },
            months: {
                shorthand: [
                    "Ene",
                    "Feb",
                    "Mar",
                    "Abr",
                    "May",
                    "Jun",
                    "Jul",
                    "Ago",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dic",
                ],
                longhand: [
                    "Enero",
                    "Febrero",
                    "Marzo",
                    "Abril",
                    "Mayo",
                    "Junio",
                    "Julio",
                    "Agosto",
                    "Septiembre",
                    "Octubre",
                    "Noviembre",
                    "Diciembre",
                ],
            },
            ordinal: () => {
                return "º";
            },
            firstDayOfWeek: 1,
            rangeSeparator: " a ",
            time_24hr: true,
        },
        onOpen: function (selectedDates, dateStr, instance) {
            // Check if the input is empty
            if (!dateStr) {
                instance.selectedDates = [];
                selectedDates = [];
            }
        }
    });
})