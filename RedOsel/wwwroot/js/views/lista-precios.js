

Vue.createApp({
    components: {
        ListaPrecio: window.componenteArchivos
    },
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            idListaPrecio: 0,
            array: {
                listaPrecios: []
            },
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                nombre: {
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
                }
            },
            /////
            tituloModal: '',
            tipoMultimedia: {
                listaPrecio: 12
            },
            value: {
                nombreFiltro: '',
                nombre: '',
                descripcion: '',
                orden: ''
            },
            check: {
                publicado: false
            },
            disabled: {
                listas: true
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
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.nombreFiltro = '';
            } else {
                this.value.orden = '';
                this.idListaPrecio = 0;
                this.value.nombre = '';
                this.value.descripcion = '';
                this.check.publicado = false;

                this.disabled.listas = true;
                this.$refs.btnListas.classList.remove('active');
                document.getElementById('listaPrecio').classList.remove(...['active', 'show']);
            }
        },
        agregarLista() {
            this.tituloModal = 'Nueva Lista de Precios'
            this.limpiar(1);
            $(this.$refs.modalListaPrecios).modal('show');
        },
        guardar() {
            let msj = '';
            if (this.value.nombre.trim() === '') {
                msj += '<li>Ingrese el nombre del grupo</li>';
            }
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (Number(this.value.orden) < 0) {
                msj += '<li>Ingrese un orden válido';
            } else {
                if (Number.isNaN(Number(this.value.orden))) {
                    msj = '<li>El valor de orden no es válido</li>';
                }
            }

            if (msj === '') {
                $('.cargando-c').show();

                let ruta = Number(this.idListaPrecio) === 0 ? 'ListaPrecios/Inserta' : 'ListaPrecios/Actualiza';

                axios.post(url + ruta, {
                    idListaPrecio: this.idListaPrecio,
                    nombre: this.value.nombre.trim(),
                    descripcion: this.value.descripcion.trim(),
                    publicado: this.check.publicado,
                    idUsuario: mainApp.idUsuario,
                    orden: this.value.orden
                }).then(res => {
                    if (Number(this.idListaPrecio) === 0) {
                        alerts.success('Lista de precios guardada');
                        this.idListaPrecio = res.data;
                        this.disabled.listas = false;
                        setTimeout(a => {
                            this.$refs.btnListas.click();
                        }, 0)
                    } else {
                        alerts.success('Lista de precios actualizada');
                    }

                    this.getListas();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        getListas() {
            $('.cargando-c').show();
            axios.post(url + 'ListaPrecios/Consulta', {
                nombre: this.value.nombreFiltro.trim()
            }).then(res => {
                this.array.listaPrecios = res.data;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getLista(item) {
            $('.cargando-c').show();
            axios.post(url + 'ListaPrecios/Recupera', {
                idListaPrecio: item.id_lista_precios
            }).then(res => {
                this.tituloModal = 'Edición Lista de Precios'
                this.limpiar(1);

                let ds = res.data;

                this.idListaPrecio = ds.id_lista_precios;
                this.value.nombre = ds.nombre;
                this.value.descripcion = ds.descripcion;
                this.check.publicado = ds.publicado;

                this.disabled.listas = false;
                setTimeout(a => {
                    this.$refs.btnListas.click();
                }, 0)

                this.value.orden = ds.orden ?? 0;

                $(this.$refs.modalListaPrecios).modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async listaPreciosElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar <i><u>${item.nombre}</u></i>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'ListaPrecios/Elimina', {
                    idListaPrecio: item.id_lista_precios,
                    idUsuario: mainApp.idUsuario
                }).then(res => {
                    alerts.success('Lista de precios eliminada');

                    this.getListas();
                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
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
                        this.sorted.nombre.asc = true;
                        this.sorted.nombre.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.nombre.iconoDesc = this.iconoDescFill;
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
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.nombre.asc) {
                        this.array.listaPrecios = sortObjectsByString(this.array.listaPrecios, 'nombre');
                    } else {
                        this.array.listaPrecios = sortObjectsByString(this.array.listaPrecios, 'nombre', false);
                    }
                    break;
                case 2:
                    if (this.sorted.descripcion.asc) {
                        this.array.listaPrecios = sortObjectsByString(this.array.listaPrecios, 'descripcion');
                    } else {
                        this.array.listaPrecios = sortObjectsByString(this.array.listaPrecios, 'descripcion', false);
                    }
                    break;
                case 3:
                    if (this.sorted.publicado.asc) {
                        this.array.listaPrecios = sortObjectByNumber(this.array.listaPrecios, 'publicado');
                    } else {
                        this.array.listaPrecios = sortObjectByNumber(this.array.listaPrecios, 'publicado', false);
                    }
                    break;
            }
        } 
    }, 
    mounted() {     
        this.getListas();
    }
}).mount('#appListaPrecio');


