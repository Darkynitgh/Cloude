


const appTiendas =Vue.createApp({
    components: {
        Ciudad: window.componenteCiudad
    },
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            totalResults: 0, // Total de elementos
            perPage: 30, // Máximo de elementos a renderizar en la tabla
            currentPage: 0, // Página actual
            maxVisibleButtons: 5, // Máximo de botones paginación a mostrar en paginador,
            totalPages: 0,
            array: {
                estados: [],
                ciudades: [],
                tiendas: [],
                ciudadesModaL: []
            },
            ddl: {
                paginacion: '30',
                estado: '0',
                ciudad: '0',
                estadoFiltro: '0',
                ciudadFiltro: '0'
            },
            value: {
                nombreFiltro: '',
                nombre: '',
                correoElectronico: '',
                direccion: '',
                telefono: '',
                link: '',
                mid: '',
                latitud: '',
                longitud: ''
            },
            geocoder: null,

            map: null,
            marker: null,
            idTienda: 0,
            idCiudad: 0,
            nueva: false,
            //Variables filtro en tablas
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                id: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                estado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                ciudad: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                tienda: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                correo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            }     
        }
    },
    methods: {
        agregarCiudad() {
            if (Number(this.ddl.estado) === 0) {
                alerts.error('Elija primero el estado');
                return;
            }
            this.nueva = true;  
        },
        VerMapa() {
            $(this.$refs.modal_tienda_mapa).modal('show');
     
        },
        async nuevaCiudad(idCiudad) {
            this.nueva = false;
            this.idCiudad = idCiudad;
            await this.getCiudades(true, this.ddl.estado);
            this.ddl.ciudad = this.idCiudad.toString();
        },
        cierraModal() {
            this.nueva = false;
        },
        ////
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.nombreFiltro = '';
                this.ddl.ciudadFiltro = '0';
                this.ddl.estadoFiltro = '0';
                this.array.ciudades = [];
            } else {
                this.idTienda = 0;
                this.ddl.estado = '0';
                this.ddl.ciudad = '0';
                this.value.nombre = '';
                this.value.correoElectronico = '';
                this.value.direccion = '';
                this.value.telefono = '';
                this.value.link = '';
                this.value.mid = '';
                this.value.latitud = '';
                this.value.longitud = '';
                this.array.ciudadesModaL = [];
            }
        },
        getEstados() {
            $('.cargando-c').show();
            axios.post(url + 'Administracion/GetClaves', {
                idTipoClave: 20
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {

                this.array.estados = res.data;
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getCiudades(rtn = false, idEstado) {
            return new Promise((success, fail) => {
                $('.cargando-c').show();
                axios.post(url + 'Ciudades/CiudadesConsulta', {
                    ciudad: '',
                    idEstado: typeof idEstado === 'undefined' ? this.ddl.estadoFiltro : idEstado
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {

                    if (!rtn) {
                        this.array.ciudades = res.data;
                        this.ddl.ciudadFiltro = '0';
                    } else {
                        this.array.ciudadesModaL = res.data;
                        this.ddl.ciudad = '0';
                    }
                 
                    $('.cargando-c').hide();

                    success(res.data);
                }).catch(err => {
                    validError(err);
                    fail(err);
                });
            })
        },
        cambiaEstado(opcion = 0) {
            if (opcion === 0) {
                if (Number(this.ddl.estadoFiltro) !== 0) {
                    this.getCiudades()
                } else {
                    this.array.ciudades = [];
                }
            } else {
                if (Number(this.ddl.estado) !== 0) {
                    this.getCiudades(true, this.ddl.estado);
                } else {
                    this.array.ciudadesModaL = [];
                }
            }
        },
        verSitio() {
            try {
                if (new URL(this.value.link.trim())) {
                    window.open(this.value.link, '_blank');
                }
            } catch (e) {
                alerts.error('URL inválida');
            }
        },
        getTiendas() {
            $('.cargando-c').show();
            axios.post(url + 'Tiendas/TiendasConsulta', {
                nombre: this.value.nombreFiltro.trim(),
                idCiudad: this.ddl.ciudadFiltro,
                idEstado: this.ddl.estadoFiltro
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {

                this.array.tiendas = res.data;
                this.totalResults = this.array.tiendas.length;
                this.totalPages = Math.ceil(this.array.tiendas.length / this.perPage);
                this.currentPage = 1;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getTienda(item) {
            $('.cargando-c').show();
            axios.post(url + 'Tiendas/TiendasRecupera', {
                idTienda: item.id_tienda
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(async res => {
                let ds = res.data;

                this.tituloModal = 'Edición Tienda';

                this.idTienda = ds.id_tienda;
                this.ddl.estado = ds.id_estado.toString();
                await this.getCiudades(true, ds.id_estado);
                this.ddl.ciudad = ds.id_ciudad.toString();
                this.value.nombre = ds.tienda;
                this.value.correoElectronico = ds.correo;
                this.value.direccion = ds.direccion;
                this.value.telefono = ds.telefono;
                this.value.link = ds.ligagooglemaps;
                this.value.mid = ds.msid;
                this.value.latitud = ds.latitud;
                this.value.longitud = ds.longitud;

                appTiendas.map.setCenter({ lat: parseFloat(this.value.latitud), lng: parseFloat(this.value.longitud) }, 8)
                //appTiendas.icon.url = url + "lib/administracion/images/icono-map.png";
                //appTiendas.icon.scaledSize = new google.maps.Size(40, 40);

                appTiendas.icon = {
                    url: url + "lib/administracion/images/icono-map.png",
                    scaledSize: new google.maps.Size(40, 40)
                }

                appTiendas.marker = new google.maps.Marker({
                    position: { lat: parseFloat(this.value.latitud), lng: parseFloat(this.value.longitud) },
                    map: appTiendas.map,
                    title: this.value.nombre,
                    icon: appTiendas.icon
                });
                //appTiendas.marker.setPosition(new google.maps.LatLng(parseFloat(this.value.latitud), parseFloat(this.value.latitud)));
                /*appTiendas.marker.icon =appTiendas.icon;*/
                

                //icon.value = {
                //    url: url + "lib/administracion/images/icono-map.png",
                //    scaledSize: new google.maps.Size(40, 40)
                //}

                //marker.value = new google.maps.Marker({
                //    position: { lat: latitud, lng: longitud },
                //    map: map,
                //    title: tienda.nombre_tienda,
                //    icon: icon
                //});

                $(this.$refs.modalTienda).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        agregarTienda() {
            this.limpiar(1);
            this.tituloModal = 'Nueva Tienda';
            $(this.$refs.modalTienda).modal('show');
        },
        abreAcordion() {
            //this.limpiar();
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        guardar() {
            let msj = '';
            if (Number(this.ddl.estado) === 0) {
                msj += '<li>Elija el estado</li>';
            }
            if (Number(this.ddl.ciudad) === 0) {
                msj += '<li>Elija la ciudad</li>';
            }
            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre</li>';
            }
            if (this.value.correoElectronico.trim() === '') {
                msj += '<li>Ingrese el correo electrónico</li>';
            }
            if (this.value.direccion.trim() === '') {
                msj += '<li>Ingrese la dirección</li>';
            }
            //if (this.value.link.trim() === '') {
            //    msj += '<li>Ingrese el link de Google Maps</li>';
            //}
            //if (this.value.mid.trim() === '') {
            //    msj += '<li>Ingrese el MID/MSID</li>';
            //}
            //if (this.value.latitud.trim() === '') {
            //    msj += '<li>Ingrese la latitud</li>';
            //} else {
            //    if (Number.isNaN(Number(this.value.latitud.trim()))) {
            //        msj += '<li>Número inválido para latitud</li>'
            //    }
            //}
            //if (this.value.longitud.trim() === '') {
            //    msj += '<li>Ingrese la longitud</li>';
            //} else {
            //    if (Number.isNaN(Number(this.value.longitud.trim()))) {
            //        msj += '<li>Número inválido para longitud</li>'
            //    }
            //}

            if (msj === '') {
                let ruta = Number(this.idTienda) === 0 ? 'Tiendas/TiendasInserta' : 'Tiendas/TiendasActualiza';

                $('.cargado-c').show();
                axios.post(url + ruta, {
                    idTienda: this.idTienda,
                    idEstado: this.ddl.estado,
                    idCiudad: this.ddl.ciudad,
                    nombre: this.value.nombre.trim(),
                    correoElectronico: this.value.correoElectronico.trim(),
                    direccion: this.value.direccion.trim(),
                    telefono: this.value.telefono.trim(),
                    link: this.value.link.trim(),
                    mid: this.value.mid.trim(),
                    latitud: this.value.latitud.trim(),
                    longitud: this.value.longitud.trim()
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    if (Number(this.idTienda) === 0) {
                        alerts.success('Tienda guardada');
                    } else {
                        alerts.success('Tienda actualizada');
                    }

                    $(this.$refs.modalTienda).modal('hide');
                    $('.cargado-c').hide();
                    this.getTiendas();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiete', msj);
            }
        },
        async tiendaElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la tienda <i><u>${item.tienda}</u></i>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Tiendas/TiendasElimina', {
                    idTienda: item.id_tienda
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(async res => {
                    let ds = res.data;

                    alerts.success('Tienda eliminada');

                    $('.cargando-c').hide();

                    this.getTiendas();
                }).catch(err => validError(err));
            }
        },
        // Funciones Paginación
        onClickFirstPage() {
            this.onPageChange(1);
        },
        onClickPreviousPage() {
            this.onPageChange(this.currentPage - 1);
        },
        onClickPage(page) {
            this.onPageChange(page);
        },
        onClickNextPage() {
            this.onPageChange(this.currentPage + 1);
        },
        onClickLastPage() {
            this.onPageChange(this.totalPages);
        },
        isPageActive(page) {
            let marked = false
            if (this.currentPage === page) {
                marked == true
            }
            return marked
        },
        onPageChange(page) {
            ////console.log('page\n', page)
            this.currentPage = parseInt(page);
        },
        filteredItem() {
            return this.array.tiendas.slice((this.currentPage - 1) * this.perPage, (((this.currentPage - 1) * this.perPage) + this.perPage))
        },
        cambiaPaginacion() {
            this.perPage = parseInt(this.ddl.paginacion)
            this.totalPages = Math.ceil(this.array.tiendas.length / this.perPage)
            this.currentPage = 1
        },
        /**
        * 
        * SORTED FUNCTIONS
        * 
        */
        eligeFiltro(opcion, asc = true) {

            for (const i in this.sorted) {
                this.sorted[i].asc = false;
                this.sorted[i].iconoAsc = this.iconoAsc;
                this.sorted[i].iconoDesc = this.iconoDesc;
            }

            switch (opcion) {
                case 1:
                    if (asc) {
                        this.sorted.id.asc = true;
                        this.sorted.id.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.id.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
                    if (asc) {
                        this.sorted.estado.asc = true;
                        this.sorted.estado.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.estado.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.ciudad.asc = true;
                        this.sorted.ciudad.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.ciudad.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
                    if (asc) {
                        this.sorted.tienda.asc = true;
                        this.sorted.tienda.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.tienda.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 5:
                    if (asc) {
                        this.sorted.correo.asc = true;
                        this.sorted.correo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.correo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.id.asc) {
                        this.array.tiendas = sortObjectByNumber(this.array.tiendas, 'id_tienda');
                    } else {
                        this.array.tiendas = sortObjectByNumber(this.array.tiendas, 'id_tienda', false);
                    }
                    break;
                case 2:
                    if (this.sorted.estado.asc) {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'estado');
                    } else {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'estado', false);
                    }
                    break;
                case 3:
                    if (this.sorted.ciudad.asc) {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'ciudad');
                    } else {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'ciudad', false);
                    }
                    break;
                case 4:
                    if (this.sorted.tienda.asc) {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'tienda');
                    } else {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'tienda', false);
                    }
                    break;
                case 5:
                    if (this.sorted.correo.asc) {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'correo');
                    } else {
                        this.array.tiendas = sortObjectsByString(this.array.tiendas, 'correo', false);
                    }
                    break;
            }
        } 
    },
    computed: {
        startPage() {
            // When on the first page
            if (this.currentPage === 1) {
                return 1;
            }

            // When on the last page
            if (this.currentPage === this.totalPages && this.totalPages - this.maxVisibleButtons > 0 && this.currentPage <= (this.totalPages - this.maxVisibleButtons)) {
                return this.totalPages - this.maxVisibleButtons;
            }

            if ((this.totalPages - this.maxVisibleButtons) < this.currentPage && (this.totalPages - this.maxVisibleButtons) > 0) {
                return (this.totalPages - this.maxVisibleButtons) + 1
            }

            if (this.totalPages <= 10) {
                return 1;
            }

            // When inbetween            
            return this.currentPage - 1;

        },
        pages() {
            const range = [];
            if (this.startPage == (this.totalPages - this.maxVisibleButtons)) {
                this.startPage = this.startPage + 1
            }
            for (
                let i = this.startPage;
                i <= Math.min(this.startPage + this.maxVisibleButtons - 1, this.totalPages);
                i++
            ) {
                let disabled = false
                if (this.currentPage === this.totalPages && i === this.currentPage) {
                    disabled = true
                } else {
                    if (i === this.currentPage) {
                        disabled = true
                    }
                    if (this.totalPages == 1) {
                        disabled = true
                    }
                }
                range.push({
                    name: i,
                    isDisabled: disabled
                });
            }
            return range;
        },
        isInFirstPage() {
            let disabled = this.currentPage === 1 == true || this.totalPages === 1 == true ? true : false
            return disabled
        },
        isInLastPage() {
            let disabled = this.currentPage === this.totalPages == true ? true : false
            return disabled;
        },
        filtered() {
            return this.filteredItem()
        },
    },
    mounted() {
        this.getTiendas();
        this.getEstados();
    }
}).mount('#appTiendas');

window.document.onload = function (e) {
    appTiendas.geocoder = new window.google.maps.Geocoder();
}


$(document).ready(async () => {
    appTiendas.map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 19.4327562, lng: -99.1331866 },
        zoom: 18
    });
    appTiendas.marker = new google.maps.Marker({
        map: appTiendas.map,
        draggable: true
    });
});