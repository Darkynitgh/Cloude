



Vue.createApp({
    data() {
        return {
            perfiles: [], // Your profiles data
            estatus: [], // Status options
            opciones: [], // Access options
            titulo_modal: '',
            descripcion: '',
            ddl: {
                estatus: '0'
            },
            idPerfil: 0,
            tipo: 0,
            iconoAsc: 'bi bi-caret-up',
            iconoDesc: 'bi bi-caret-down',
            iconoAscFill: 'bi bi-caret-up-fill',
            iconoDescFill: 'bi bi-caret-down-fill',
            sorted: {
                perfil: {
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
        agregarPerfil() {
            this.descripcion = '';
            this.ddl.estatus = '0';
            this.titulo_modal = 'Nuevo Perfil';
            this.idPerfil = 0;
            $('#modal_perfil').modal('show');
        },
        getPermisos(perfil) {
            $('.cargando-c').show();
            axios.post(url + 'Perfiles/ConsultaAccesos', {
                idPerfil: perfil.id_perfil,
                tipo: this.tipo
            }).then(res => {

                this.opciones = res.data.map(i => {
                    return {
                        id_opcion: i.id_opcion,
                        descripcion: i.descripcion,
                        acceso: i.acceso === 1 || i.id_opcion === 61,
                        disabled: i.id_opcion === 61,
                    }
                })

                this.idPerfil = perfil.id_perfil;

                $('#modal_opciones').modal('show');
                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        async eliminarPerfil(perfil) {
            let res = await alerts.confirm('¿Está seguro de eliminar el perfil?')
            if (res) {
                $('.cargando-c').show();
                axios.post(url + 'Perfiles/PerfilElimina', { idPerfil: perfil.id_perfil }, {
                    headers: {
                        'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                    }
                }).then(res => {
                    alerts.success('Perfil eliminado');
                    $('.cargando-c').hide();
                    this.getPerfiles();
                }).catch(err => validError(err));
            }
        },
        guardar() {
            let msj = '';
            if (this.descripcion.trim() === '') {
                msj += '<li>Ingrese el nombre del perfil</li>';
            }
            if (Number(this.ddl.estatus) === 0) {
                msj += '<li>Elija un estatus</li>';
            }


            if (msj === '') {
                let ruta = '';
                if (this.idPerfil === 0) {
                    ruta = 'Perfiles/PerfilInserta';
                } else {
                    ruta = 'Perfiles/PerfilActualiza';
                }

                axios.post(url + ruta, {
                    idPerfil: this.idPerfil,
                    descripcion: this.descripcion.trim(),
                    idEstatus: this.ddl.estatus,
                    tipo: this.tipo
                }).then(response => {
                    if (this.idPerfil === 0) {
                        alerts.success('Perfil guardado');
                    } else {
                        alerts.success('Perfil actualizado');
                    }

                    this.getPerfiles();
                    $('#modal_perfil').modal('hide');
                }).catch(err => validError(err));
            } else {
                alerts.error('Verifique lo siguiente', msj);
            }
        },
        guardarOpciones() {
            $('.cargando-c').show();
            axios.post(url + 'Perfiles/OpcionesInserta', {
                idPerfil: this.idPerfil,
                opciones: this.opciones,
                idUsuario: mainApp.idUsuario
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(res => {
                alerts.success('Permisos de acceso guardados');
                mainApp.getMenu();
                $('#modal_opciones').modal('hide');

                $('.cargando-c').hide();
            }).catch(err => validError(err))
        },
        getPerfiles() {
            $('.cargando-c').show();
            axios.post(url + 'Perfiles/GetPerfiles', {
                tipo: this.tipo
            }).then(res => {
                this.perfiles = res.data;

                for (const i in this.sorted) {
                    this.sorted[i].asc = false;
                    this.sorted[i].iconoAsc = this.iconoAsc;
                    this.sorted[i].iconoDesc = this.iconoDesc;
                }

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getPerfil(perfil) {
            this.titulo_modal = 'Edita Perfil';

            $('.cargando-c').show();
            axios.post(url + 'Perfiles/GetPerfil', {
                idPerfil: perfil.id_perfil,
                tipo: this.tipo
            }).then(response => {
                let ds = response.data;
                $('#modal_perfil').modal('show');

                this.idPerfil = ds.id_perfil;
                this.descripcion = ds.perfil;
                this.ddl.estatus = ds.id_estatus;

                $('.cargando-c').hide();
            }).catch(err => validError(err));
        },
        getClaves(idTipoClave) {
            axios.post(url + 'Administracion/GetClaves', {
                idTipoClave: idTipoClave
            }, {
                headers: {
                    'Authorization': 'bearer ' + sessionStorage.getItem('tokRedOsel')
                }
            }).then(response => {
                this.estatus = response.data;
            }).catch(err => validError(err));
        },
        eligeFiltro(opcion, asc = true) {

            for (const i in this.sorted) {
                this.sorted[i].asc = false;
                this.sorted[i].iconoAsc = this.iconoAsc;
                this.sorted[i].iconoDesc = this.iconoDesc;
            }

            switch (opcion) {
                case 1:
                    if (asc) {
                        this.sorted.perfil.asc = true;
                        this.sorted.perfil.iconoAsc = this.iconoAscFill;
                    } else {
                        this.sorted.perfil.iconoDesc = this.iconoDescFill;
                    }
                    this.sortDocumentos(Number(opcion));
                    break;
                case 2:
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
                    if (this.sorted.perfil.asc) {
                        this.perfiles = sortObjectsByString(this.perfiles, 'perfil');
                    } else {
                        this.perfiles = sortObjectsByString(this.perfiles, 'perfil', false);
                    }
                    break;
                case 2:
                    if (this.sorted.estatus.asc) {
                        this.perfiles = sortObjectsByString(this.perfiles, 'estatus');
                    } else {
                        this.perfiles = sortObjectsByString(this.perfiles, 'estatus', false);
                    }
                    break;
            }
        } 
    },
    mounted() {
        this.tipo = Number(this.$refs.inputTipo.value.trim());

        this.getClaves(2);
        this.getPerfiles();
    }
}).mount('#appPerfiles');