



let modalDetalle;


Vue.createApp({
    data() {
        return {
            array: {
                productosHomologados: [],
                certificados: [],
                certificadosSinProductos: []
            },
            certificacion: '',
            contenido: '',
            srcLogoMini: ''
        }
    },
    methods: {
        getProductosHomologados() {
            setLoader();
            axios.post(`${url}RedOsel/ProductosHomologadosConsulta`, {
                nombre: '',
                publicado: 1,
                orden: 1
            }).then(res => {
                if (res.data.length > 0) {
                    this.array.productosHomologados = res.data?.map(i => {
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_creacion).toFormat('dd-MMM-yyyy'),
                            ruta: document.location.origin + '/RedOsel/archivos/multimedia/productos-homologados/' + i.logo_mini,
                            registros: i.registros?.map(i => {
                                return {
                                    productos: i?.productos?.map(j => {
                                        return {
                                            ...j,
                                            href: document.location.origin + '/RedOsel/archivos/multimedia/' + j.id_tipo_multimedia + '/' + j.archivo
                                        }
                                    }),
                                    certificados: i?.certificados?.map(k => {
                                        return {
                                            ...k,
                                            href: document.location.origin + '/RedOsel/archivos/multimedia/' + k.id_tipo_multimedia + '/' + k.archivo
                                        }
                                    })
                                }
                            })
                            //multimedia: i?.multimedia?.map(a => {
                            //    return {
                            //        ...a,
                            //        ruta: document.location.origin + '/RedOsel/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.archivo
                            //    }
                            //})
                        };
                    })
                }
                setLoader('hide')
            }).catch(err => validError(err));
        },
        detalleProductoHomologado(item) {
            modalDetalle.show();

            console.log(item);

            this.srcLogoMini = document.location.origin + '/RedOsel/archivos/multimedia/productos-homologados/' + item.logo;
            this.contenido = item.descripcion;
            this.certificacion = item.nombre;

            let nulos = item.registros.filter(i => i.certificados.length === 0 && i.productos.length === 0);
            this.array.certificados = item.registros
                .filter(i => !nulos.includes(i));
            //this.array.certificadosConProductos = [];
            //this.array.certificadosSinProductos = [];
            //item.multimedia.forEach(i => {
            //    if (i.productos.length > 0) {
            //        this.array.certificadosConProductos.push({
            //            productos: i.productos,
            //            href: document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo,
            //            certificacion: i.titulo
            //        });
            //    }
            //})
            //item.multimedia.forEach(i => {
            //    if (i.productos.length === 0) {
            //        this.array.certificadosSinProductos.push({
            //            href: document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo,
            //            certificacion: i.titulo
            //        });
            //    }
            //})
        }
    },
    mounted() {
        mainApp.getMenu().then(res => {
            mainApp.setBanner(91, 'mainBg', 'divBanner');
            this.getProductosHomologados();
            modalDetalle = new bootstrap.Modal(this.$refs.modalDetalle);
        }).catch(err => {
            validError(err);
        });
    }
}).mount('#appProductosHomologados')