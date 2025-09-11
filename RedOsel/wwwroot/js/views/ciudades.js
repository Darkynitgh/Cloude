

Vue.createApp({
    components: {
        Ciudad: componenteCiudad
    },
    data() {
        return {
            totalResults: 0, // Total de elementos
            perPage: 30, // Máximo de elementos a renderizar en la tabla
            currentPage: 0, // Página actual
            maxVisibleButtons: 5, // Máximo de botones paginación a mostrar en paginador,
            totalPages: 0,
            icono: 'lnr lnr-chevron-down',
            ddl: {
                estado: "0",
                paginacion: '30'
            },
            array: {
                estados: [],
                ciudades: []
            },
            value: {
                ciudadFiltro: ''
            },
            idCiudad: 0,
            nuevaCiudad: false,
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
                ciudad: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                estado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                estatus: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            }    
        };
    },
    methods: {
        abreAcordion() {
            this.limpiar();
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        agregarCiudad() {
            this.nuevaCiudad = true;
        },
        cierraModal() {
            this.nuevaCiudad = false;
        },
        async getCiudades() {
            $('.cargando-c').show();
            axios.post(url + 'Ciudades/CiudadesConsulta', {
                ciudad: this.value.ciudadFiltro.trim(),
                idEstado: this.ddl.estado 
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {

                this.array.ciudades = res.data;
                this.totalResults = this.array.ciudades.length;
                this.totalPages = Math.ceil(this.array.ciudades.length / this.perPage);
                this.currentPage = 1;


                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getCiudad(item) {
            this.idCiudad = Number(item.id_ciudad);
        },
        async ciudadElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la ciudad <u><i>${item.ciudad}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Ciudades/CiudadesElimina', {
                    idCiudad: item.id_ciudad
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {

                    alerts.success('Ciudad eliminada');
                    this.getCiudades();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        async getEstados() {
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
        limpiar() { 
            this.value.ciudad = '';
            this.ddl.estado = '0';
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
            this.currentPage = parseInt(page);
        },
        filteredItem() {
            return this.array.ciudades.slice((this.currentPage - 1) * this.perPage, (((this.currentPage - 1) * this.perPage) + this.perPage))
        },
        cambiaPaginacion() {
            this.perPage = parseInt(this.ddl.paginacion)
            this.totalPages = Math.ceil(this.array.ciudades.length / this.perPage)
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
                        this.sorted.ciudad.asc = true;
                        this.sorted.ciudad.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.ciudad.iconoDesc = this.iconoDescFill;
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
                        this.sorted.estatus.asc = true;
                        this.sorted.estatus.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.estatus.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.ciudad.asc) {
                        this.array.ciudades = sortObjectsByString(this.array.ciudades, 'ciudad');
                    } else {
                        this.array.ciudades = sortObjectsByString(this.array.ciudades, 'ciudad', false);
                    }
                    break;
                case 2:
                    if (this.sorted.estado.asc) {
                        this.array.ciudades = sortObjectsByString(this.array.ciudades, 'estado');
                    } else {
                        this.array.ciudades = sortObjectsByString(this.array.ciudades, 'estado', false);
                    }
                    break;
                case 3:
                    if (this.sorted.estatus.asc) {
                        this.array.ciudades = sortObjectByNumber(this.array.ciudades, 'estatus');
                    } else {
                        this.array.ciudades = sortObjectByNumber(this.array.ciudades, 'estatus', false);
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
        this.getEstados();
        this.getCiudades();
    },
}).mount('#appCiudades')