





Vue.createApp({
    components: {
        Archivos: window.componenteArchivos
    },
    data() {
        return {
            icono: 'lnr lnr-chevron-down',
            array: {
                avisos: [],
                tiposAviso: []
            },
            ddl: {
                tipoAviso: '0'
            },
            value: {
                descripcionFiltro: '',
                descripcion: '',
                url: '',
                fecha: ''
            },
            check: {
                publicado: false,
                principal: false,
                link: false,
                video: false
            },
            tituloModal: '',
            tipoMultimedia: {
                archivos: 8
            },
            disabled: {
                archivos: true
            },
            idAviso: 0,
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
                fecha: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                publicado: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                principal: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                },
                tipo: {
                    asc: false,
                    iconoAsc: '',
                    iconoDesc: ''
                }
            }  
        };
    },
    methods: {
        activaLink(evt) {
            if (Number(this.idAviso) !== 0) {
                if (evt.target.checked) {
                    this.disabled.archivos = true;
                    this.$refs.btnArchivos.classList.remove('active');
                    document.getElementById('archivos').classList.remove(...['active', 'show']);                   

                    this.check.video = false;
                    this.value.url = '';
                    this.check.link = false;
                } else {
                    this.disabled.archivos = false;
                    this.$refs.btnArchivos.classList.remove('active');
                    document.getElementById('archivos').classList.remove(...['active', 'show']);
                    setTimeout(a => {
                        this.$refs.btnArchivos.click();
                    }, 150);
                }
            }
            
            this.value.url = '';
        },
        abreAcordion() {
            if (this.icono.indexOf('down') !== -1) {
                this.icono = 'lnr lnr-chevron-up';
            } else {
                this.icono = 'lnr lnr-chevron-down';
            }
        },
        limpiar(opcion = 0) {
            if (opcion === 0) {
                this.value.descripcionFiltro = '';
            } else {
                this.idAviso = 0;
                this.ddl.tipoAviso = '0';
                this.value.descripcion = '';
                this.check.publicado = false;
                this.check.principal = false;
                this.check.link = false;
                this.value.url = '';
                this.value.fecha = '';
                this.disabled.archivos = true;
                this.check.video = false;

                setTimeout(a => {
                    document.getElementById('archivos').classList.remove(...['show', 'active']);
                    this.$refs.btnArchivos.classList.remove('active');
                }, 150);
            }
        },
        agregarAviso() {
            this.tituloModal = 'Nuevo Aviso';
            this.limpiar(1);
            $(this.$refs.modalAviso).modal('show');
        },
        guardar() {
            let msj = '';
            if (this.value.descripcion.trim() === '') {
                msj += '<li>Ingrese la descripción</li>';
            }
            if (this.value.fecha.trim() === '') {
                msj += '<li>Ingrese la fecha</li>';
            }
            if (Number(this.ddl.tipoAviso) === 0) {
                msj += '<li>Elija el tipo de aviso</li>';
            }
            if (this.check.link && this.value.url.trim() === '') {
                msj += '<li>Ingrese la URL</li>'
            } else if (this.check.link && !this.isUrlValid(this.value.url.trim(), true)) {
                msj += '<li>La URL no tiene un formato válido</li>';
            }

            if (msj === '') {
                let ruta = Number(this.idAviso) === 0 ? 'Avisos/AvisoInserta' : 'Avisos/AvisoActualiza';

                $('.cargando-c').show();
                axios.post(url + ruta, {
                    idAviso: this.idAviso,
                    descripcion: this.value.descripcion.trim(),
                    fecha: this.value.fecha.trim(),
                    publicado: this.check.publicado,
                    avisoPrincipal: this.check.principal,
                    url: this.value.url.trim(),
                    link: this.check.link,
                    esVideo: this.check.video,
                    idUsuario: mainApp.idUsuario,
                    idTipoAviso: this.ddl.tipoAviso
                }).then(res => {
                    if (Number(this.idAviso) === 0) {
                        alerts.success('Aviso guardado');

                        this.idAviso = res.data;

                        if (!this.check.false) {
                            this.disabled.archivos = false;
                            this.$refs.btnArchivos.click();
                        }
                    } else {
                        alerts.success('Aviso actualizado');
                    }

                    $('.cargando-c').hide();
                    this.getAvisos();
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
        getDate(inputDate) {
            return luxon.DateTime.fromISO(inputDate).toFormat("dd/MM/yyyy");
        },
        getAvisos() {
            $('.cargando-c').show();
            axios.post(url + 'Avisos/AvisoConsulta', {
                descripcion: this.value.descripcionFiltro.trim(),
                idTipoMultimedia: '8,'
            }).then(res => {
                let ds = res.data === '' ? [] : res.data;
                this.array.avisos = ds;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getAviso(item) {
            $('.cargando-c').show();
            axios.post(url + 'Avisos/AvisoRecupera', {
                idAviso: item.idAviso
            }).then(res => {
                let ds = res.data;

                this.tituloModal = 'Edición Aviso';
                this.value.descripcion = ds.descripcion;
                this.value.fecha = this.getDate(ds.fecha);
                this.value.url = ds.urlMedia;
                this.check.publicado = ds.publicar;
                this.check.principal = ds.avisoPrincipal;
                this.check.link = ds.link;

                this.idAviso = ds.idAviso;
                this.ddl.tipoAviso = ds.id_tipo_aviso?.toString() ?? '0';

                this.disabled.archivos = false;
                this.check.video = ds.video;


                if (!this.check.link) {
                    setTimeout(a => {
                        this.$refs.btnArchivos.click();

                    }, 150)
                } else {
                    this.disabled.archivos = true;
                    this.$refs.btnArchivos.classList.remove('active');
                    document.getElementById('archivos').classList.remove(...['active', 'show']);    
                }

                $(this.$refs.modalAviso).modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async avisoElimina(item) {
            let res = await alerts.confirm(`¿Está seguro de eliminar el aviso <u><i>${item.descripcion.trim()}</i></u>?`);
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Avisos/AvisoElimina', {
                    idAviso: item.idAviso,
                    idUsuario: mainApp.idUsuario
                }).then(res => {
                    alerts.success('Aviso eliminado');
                    this.getAvisos();

                    $('.cargando-c').hide();
                }).catch(err => validError(err));
            }
        },
        getClaves(idTipoClave) {
            axios.post(url + 'Administracion/GetClaves', {
                idTipoClave: idTipoClave
            }).then(response => {
                this.array.tiposAviso = response.data;
            }).catch(err => validError(err));
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
                        this.sorted.fecha.asc = true;
                        this.sorted.fecha.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.fecha.iconoDesc = this.iconoDescFill;
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
                        this.sorted.principal.asc = true;
                        this.sorted.principal.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.principal.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                case 6:
                    if (asc) {
                        this.sorted.tipo.asc = true;
                        this.sorted.tipo.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.tipo.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
            }
        },
        sortDocumentos(opcion) {
            switch (opcion) {
                case 1:
                    if (this.sorted.id.asc) {
                        this.array.avisos = sortObjectByNumber(this.array.avisos, 'idAviso');
                    } else {
                        this.array.avisos = sortObjectByNumber(this.array.avisos, 'idAviso', false);
                    }
                    break;
                case 2:
                    if (this.sorted.descripcion.asc) {
                        this.array.avisos = sortObjectsByString(this.array.avisos, 'descripcion');
                    } else {
                        this.array.avisos = sortObjectsByString(this.array.avisos, 'descripcion', false);
                    }
                    break;
                case 3:
                    if (this.sorted.fecha.asc) {
                        this.array.avisos = sortOBjectByDate(this.array.avisos, 'fecha', true, 0, true);
                    } else {
                        this.array.avisos = sortOBjectByDate(this.array.avisos, 'fecha', false, 0, true);
                    }
                    break;
                case 4:
                    if (this.sorted.publicado.asc) {
                        this.array.avisos = sortObjectByNumber(this.array.avisos, 'publicar');
                    } else {
                        this.array.avisos = sortObjectByNumber(this.array.avisos, 'publicar', false);
                    }
                    break;
                case 5:
                    if (this.sorted.principal.asc) {
                        this.array.avisos = sortObjectByNumber(this.array.avisos, 'avisoPrincipal');
                    } else {
                        this.array.avisos = sortObjectByNumber(this.array.avisos, 'avisoPrincipal', false);
                    }
                    break;
                case 6:
                    if (this.sorted.tipo.asc) {
                        this.array.avisos = sortObjectsByString(this.array.avisos, 'tipo');
                    } else {
                        this.array.avisos = sortObjectsByString(this.array.avisos, 'tipo', false);
                    }
                    break;
            }
        } 
    },
    mounted() {
        this.getClaves(21);
        this.getAvisos();
    }
}).mount('#appArchivos');



