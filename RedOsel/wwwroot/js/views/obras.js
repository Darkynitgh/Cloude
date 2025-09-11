
Vue.createApp({
    components: {   
        Miniatura: window.componenteArchivos,
        Principales: window.componenteArchivos
    },
    data() {
        return {
            tipoMultimedia: {
                miniatura: 6,
                principal: 7
            },
            icono: 'lnr lnr-chevron-down',
            array: {
                obras: [],
            },
            ddl: {
                paginacion: '30'
            },
            value: {
                descripcionFiltro: '',
                descripcion: '',
                orden: 0,
                nombreCorto: ''
            },
            check: {
                publicado: false
            },
            disabled: {
                miniatura: false,
                principales: false
            },  
            tituloModal: '',
            ////////////
            totalResults: 0, // Total de elementos
            perPage: 30, // Máximo de elementos a renderizar en la tabla
            currentPage: 0, // Página actual
            maxVisibleButtons: 5, // Máximo de botones paginación a mostrar en paginador,
            totalPages: 0,
            ////////////
            idObra: 0,
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
                descripcion: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                publicado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                orden: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            }   
        }
    },
    methods: {
        abreAcordion() {            
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },       
        agregarObra() {
            this.limpiar(1);

            this.tituloModal = 'Nueva Obra';

            setTimeout(a => {
                document.getElementById('miniatura').classList.remove(...['show', 'active']);
                this.$refs.btnMiniatura.classList.remove('active');
            }, 150);

            $(this.$refs.modalObra).modal('show');
        },
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.descripcionFiltro = '';
            } else {
                this.idObra = 0;

                this.value.nombreCorto = '';
                this.disabled.miniatura = true;
                this.disabled.principales = true;

                this.value.descripcion = '';
                this.check.publicado = false;
                this.value.orden = 0;


                this.$refs.btnMiniatura.click();
            }
        },
        getObras() {
            $('.cargando-c').show();
            axios.post(url + 'Obras/ObraConsulta', {
                descripcion: this.value.descripcionFiltro.trim()
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                var ds = res.data ?? '';
                this.array.obras = ds.length === 0 ? [] : ds;

                this.totalResults = this.array.obras.length;
                this.totalPages = Math.ceil(this.array.obras.length / this.perPage);
                this.currentPage = 1;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }


                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getObra(item) {
            $('.cargando-c').show();
            axios.post(url + 'Obras/ObraRecupera', {
                idGaleriaObra: item.idGaleriaObras,
                idTipoMultimedia: '6,7'
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                this.limpiar(1);

                this.tituloModal = 'Edición Obra';

                this.disabled.miniatura = false;
                this.disabled.principales = false;
                this.idObra = res.data.idGaleriaObras;
                this.value.descripcion = res.data.descripcion;
                this.value.orden = res.data.orden;
                this.check.publicado = res.data.publicado;

                this.value.nombreCorto = res.data.nombre_corto ?? '';

                setTimeout(a => {
                    this.$refs.btnMiniatura.click();
                    document.getElementById('miniatura').classList.add(...['show', 'active']);
                }, 50);
        
                $(this.$refs.modalObra).modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        guardar() {
            let msj = '';
            if (this.value.nombreCorto.trim() === '') {
                msj += '<li>Ingrese la descripción corta de la obra</li>'
            } else {
                if (this.value.nombreCorto.trim().length > 40) {
                    msj += '<li>La descripción corta no puede ser mayor a 40 caracteres</li>'
                }
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción de la obra</>';
            }
            
            if (Number(this.value.orden) < 0) {
                msj += '<li>Ingrese un orden válido</li>';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj += '<li>El valor de "Orden" es inválido</li>';
                }
            }

            if (msj === '') {
                var data = {
                    idGaleriaObra: this.idObra,
                    descripcion: this.value.descripcion.trim(),
                    orden: this.value.orden,
                    publicado: this.check.publicado,
                    idUsuario: mainApp.idUsuario,
                    nombreCorto: this.value.nombreCorto.trim()
                }

                let ruta = Number(this.idObra) === 0 ? 'Obras/ObraInserta' : 'Obras/ObraActualiza';

                $('.cargando-c').show();
                axios.post(url + ruta, data, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    if (Number(this.idObra) === 0) {
                        alerts.success('Obra guardada');
                        this.idObra = res.data;

                        this.disabled.miniatura = false;
                        this.disabled.principales = false;
                        this.$refs.btnMiniatura.click();
                    }
                    else {
                        alerts.success('Obra actualizada');
                    }

                    $('.cargando-c').hide();
                    this.getObras();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },  
        async eliminaObra(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar la obra <i><u>${item.descripcion}</u></i>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Obras/ObraElimina', {
                    idGaleriaObra: item.idGaleriaObras,
                    idUsuario: mainApp.idUsuario
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {

                    alerts.success('Obra eliminada');
                    $('.cargando-c').hide();

                    this.getObras();
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
            return this.array.obras.slice((this.currentPage - 1) * this.perPage, (((this.currentPage - 1) * this.perPage) + this.perPage))
        },
        cambiaPaginacion() {
            this.perPage = parseInt(this.ddl.paginacion)
            this.totalPages = Math.ceil(this.array.obras.length / this.perPage)
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
                        this.sorted.descripcion.asc = true;
                        this.sorted.descripcion.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.descripcion.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 3:
                    if (asc) {
                        this.sorted.publicado.asc = true;
                        this.sorted.publicado.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.publicado.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
                    if (asc) {
                        this.sorted.orden.asc = true;
                        this.sorted.orden.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.orden.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.id.asc) {
                        this.array.obras = sortObjectByNumber(this.array.obras, 'idGaleriaObras');
                    } else {
                        this.array.obras = sortObjectByNumber(this.array.obras, 'idGaleriaObras', false);
                    }
                    break;
                case 2:
                    if (this.sorted.descripcion.asc) {
                        this.array.obras = sortObjectsByString(this.array.obras, 'descripcion');
                    } else {
                        this.array.obras = sortObjectsByString(this.array.obras, 'descripcion', false);
                    }
                    break;
                case 3:
                    if (this.sorted.publicado.asc) {
                        this.array.obras = sortObjectByNumber(this.array.obras, 'publicado');
                    } else {
                        this.array.obras = sortObjectByNumber(this.array.obras, 'publicado', false);
                    }
                    break;
                case 4:
                    if (this.sorted.orden.asc) {
                        this.array.obras = sortObjectByNumber(this.array.obras, 'orden');
                    } else {
                        this.array.obras = sortObjectByNumber(this.array.obras, 'orden', false);
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
        this.getObras();
    }
}).mount('#appObras');