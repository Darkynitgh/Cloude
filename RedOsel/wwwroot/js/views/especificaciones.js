

Vue.createApp({
    components: {
        Archivos: window.componenteArchivos,
        ImagenEmpresa: window.componenteArchivos
    },
    data() {
        return {
            totalResults: 0, // Total de elementos
            perPage: 30, // Máximo de elementos a renderizar en la tabla
            currentPage: 0, // Página actual
            maxVisibleButtons: 5, // Máximo de botones paginación a mostrar en paginador,
            totalPages: 0,
            ////////////
            icono: 'lnr lnr-chevron-down',
            value: {
                descripcionFiltro: '',
                descripcion: '',
                orden: 0,
                url: '',
                contenido: ''
            },
            array: {
                especificaciones: []
            },
            ddl: {
                paginacion: '30'
            },
            check: {
                publicado: false
            },
            tipoMultimedia: {
                imagenEmpresa: 4,
                archivos: 5
            },
            disabled: {
                imagenEmpresa: true,
                archivos: true
            },
            tituloModal: '',
            idEspecificacion: 0,
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
                url: {
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
            this.limpiar();
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        agregarEspecificacion() {
            this.limpiar(1);

            this.tituloModal = 'Nueva Especificación';

            
            setTimeout(a => {
                document.getElementById('imagenEmpresa').classList.remove(...['active', 'show']);
            }, 150);
            $(this.$refs.modalEspecificaciones).modal('show');
        },
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.descripcionFiltro = '';
            } else {
                this.value.descripcion = '';
                this.value.orden = 0;
                this.value.url = '';
                this.check.publicado = false;
                this.value.contenido = '';
                this.idEspecificacion = 0;
                this.disabled.imagenEmpresa = true;
                this.disabled.archivos = true;

                this.$refs.btnImagenEmpresa.click();
                this.$refs.btnImagenEmpresa.classList.remove('active');
            }
        },
        guardar() {
            let msj = '';
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (Number(this.value.orden) < 0) {
                msj += '<li>Orden inválido</li>';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj += '<li>El número para "Orden" es inválido</li>';
                }
            }
            //if (!this.isUrlValid(this.value.url.trim(), true)) {
            //    msj += '<li>Ingrese una URL válida</li>';
            //}
            if (this.value.contenido.trim() === '') {
                msj += '<li>Ingrese el contenido de la especificación</li>';
            }

            if (msj === '') {
                let ruta = Number(this.idEspecificacion) === 0 ? 'Especificaciones/EspecificacionesInserta' : 'Especificaciones/EspecificacionesActualiza';

                $('.cargando-c').show();
                axios.post(url + ruta, {
                    idEspecificacion: this.idEspecificacion,
                    descripcion: this.value.descripcion.trim(),
                    publicado: this.check.publicado,
                    especificacion: this.value.contenido,
                    orden: this.value.orden,
                    url: this.value.url,
                    idUsuario: mainApp.idUsuario
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    if (Number(this.idEspecificacion) === 0) {
                        this.idEspecificacion = res.data;

                        this.disabled.imagenEmpresa = false;
                        this.disabled.archivos = false;

                        setTimeout(a => {
                            this.$refs.btnImagenEmpresa.click();
                        }, 20)

                        alerts.success('Especificación guardada');
                    } else {
                        alerts.success('Especificación actualizada');
                    }

                    this.getEspecificaciones();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        isUrlValid(url, rtn = false) {
            try {
                if (url.trim() !== '') {
                    new URL(url);
                    return true;
                }
            } catch (e) {
                if (!rtn) {
                    alerts.error('URL inválida');
                }
                return false;
            }
        },
        getEspecificaciones() {
            this.array.especificaciones = [];

            $('.cargando-c').show();
            axios.post(url + 'Especificaciones/EspecificacionesConsulta', {
                descripcion: this.value.descripcionFiltro.trim()
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(async res => {
                let ds = res.data;

                this.array.especificaciones = ds === '' ? [] : ds;

                this.totalResults = this.array.especificaciones.length;
                this.totalPages = Math.ceil(this.array.especificaciones.length / this.perPage);
                this.currentPage = 1;



                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getEspecificacion(item) {
            $('.cargando-c').show();
            axios.post(url + 'Especificaciones/EspecificacionesRecupera', {
                idEspecificacion: item.idEspecificacion,
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                this.limpiar(1);

                this.tituloModal = 'Edición de Especificación';

                let ds = res.data;

                this.idEspecificacion = ds.idEspecificacion;
                this.value.descripcion = ds.titulo;
                this.check.publicado = ds.publicado; 
                this.value.url = ds.url;
                this.value.orden = ds.orden;
                this.value.contenido = ds.especificacion;


                this.disabled.imagenEmpresa = false;
                this.disabled.archivos = false;

                setTimeout(a => {
                    this.$refs.btnImagenEmpresa.click();
                }, 20)

                $(this.$refs.modalEspecificaciones).modal('show');

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async especificacionElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de elimina ${item.titulo}?`)
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Especificaciones/EspecificacionesElimina', {
                    idEspecificacion: item.idEspecificacion,
                    idUsuario: mainApp.idUsuario
                }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(async res => {
                    let ds = res.data;

                    alerts.success('Especificación eliminada');
                    this.getEspecificaciones();


                    $('.cargando-c').hide();
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
            return this.array.especificaciones.slice((this.currentPage - 1) * this.perPage, (((this.currentPage - 1) * this.perPage) + this.perPage))
        },
        cambiaPaginacion() {
            this.perPage = parseInt(this.ddl.paginacion)
            this.totalPages = Math.ceil(this.array.especificaciones.length / this.perPage)
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
                        this.sorted.url.asc = true;
                        this.sorted.url.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.url.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 4:
                    if (asc) {
                        this.sorted.publicado.asc = true;
                        this.sorted.publicado.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.publicado.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 5:
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
                        this.array.especificaciones = sortObjectByNumber(this.array.especificaciones, 'idEspecificacion');
                    } else {
                        this.array.especificaciones = sortObjectByNumber(this.array.especificaciones, 'idEspecificacion', false);
                    }
                    break;
                case 2:
                    if (this.sorted.descripcion.asc) {
                        this.array.especificaciones = sortObjectsByString(this.array.especificaciones, 'titulo');
                    } else {
                        this.array.especificaciones = sortObjectsByString(this.array.especificaciones, 'titulo', false);
                    }
                    break;
                case 3:
                    if (this.sorted.url.asc) {
                        this.array.especificaciones = sortObjectsByString(this.array.especificaciones, 'url');
                    } else {
                        this.array.especificaciones = sortObjectsByString(this.array.especificaciones, 'url', false);
                    }
                    break;
                case 4:
                    if (this.sorted.publicado.asc) {
                        this.array.especificaciones = sortObjectByNumber(this.array.especificaciones, 'publicado');
                    } else {
                        this.array.especificaciones = sortObjectByNumber(this.array.especificaciones, 'publicado', false);
                    }
                    break;
                case 5:
                    if (this.sorted.orden.asc) {
                        this.array.especificaciones = sortObjectByNumber(this.array.especificaciones, 'orden');
                    } else {
                        this.array.especificaciones = sortObjectByNumber(this.array.especificaciones, 'orden', false);
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
        this.getEspecificaciones();
    }
}).mount('#appEspecificaciones');