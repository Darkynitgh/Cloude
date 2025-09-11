let modalDetalle;




Vue.createApp({
    data() {
        return {
            array: {
                equipos: []
            },
            descripcionImagen: '',
            rutaArchivo: '',
            srcLogo: '',
            imageSrc: '',
            zoomVisible: false, // Toggles the visibility of the zoom lens and result
            lensPosition: { x: 0, y: 0 }, // Position of the lens
            zoomBackgroundPosition: { x: 0, y: 0 }, // Position of the zoomed background,
            marca: '',
            idMarca: 0,
            src: '',
            srcMarca: ''
        }
    },
    computed: {
        zoomResultStyle() {
            return {
                backgroundImage: `url(${this.imageSrc})`,
                backgroundPosition: `${this.zoomBackgroundPosition.x}% ${this.zoomBackgroundPosition.y}%`,
                backgroundSize: "150%", // Adjust zoom level,
                display: 'block'
            };
        }
    },
    methods: {
        verImagen(item) {
            this.array.equipos.forEach(i => {
                i.over = false;
            });
            item.over = true;
            this.src = item.ruta;
        },
        getEquipos() {
            setLoader();
            axios.post(`${url}RedOsel/EquiposConsulta`, {
                descripcion: '',
                orden: 1,
                publicado: 1
            }).then(res => {
                if (res.data.length > 0) {
                    let marcas = res.data?.map(i => {
                        let mult = [];
                        if (i.multimedia.length > 0) {
                            mult = i?.multimedia?.map(a => {
                                return {
                                    ...a,
                                    ruta: document.location.origin + '/RedOsel/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.imagen,
                                    href: document.location.origin + '/RedOsel/archivos/multimedia/' + a.id_tipo_multimedia + '/' + a.archivo
                                }
                            })
                        }
                    
                        return {
                            ...i,
                            fecha: luxon.DateTime.fromISO(i.fecha_creacion).toFormat('dd-MMM-yyyy'),
                            items: mult,
                            logo: document.location.origin + '/RedOsel/archivos/multimedia/marcas-equipos/' + i.logo
                        };
                    })

                    //setTimeout(_ => {
                    //    var carousel = document.querySelectorAll('.carousel');

                    //    carousel.forEach(i => {
                    //        new bootstrap.Carousel(i, {
                    //            interval: 2000,
                    //            touch: true
                    //        })
                    //    });
                    //}, 250)

                    var item = marcas.find(i => i.id_equipo_marca === Number(this.idMarca));

                    this.srcMarca = item.logo;
                    this.array.equipos = item.items;
                    this.verImagen(this.array.equipos[0]);                  
                    this.marca = marcas.find(i => i.id_equipo_marca === Number(this.idMarca)).nombre;
                }


                setLoader('hide')
            }).catch(err => validError(err))
        },
        descargar(i) {
            let anchor = document.createElement('a');
            anchor.href = this.rutaArchivo;
            //anchor.href = document.location.origin + '/RedOsel/archivos/multimedia/' + i.id_tipo_multimedia + '/' + i.archivo;
            anchor.download = '';
            anchor.setAttribute('download', '');
            anchor.target = '_blank';
            anchor.click();
            anchor.remove();
        },
        chunkArray(array, chunkSize) {
            const newArray = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                // Extract a chunk of size `chunkSize` and push it to the new array
                newArray.push(array.slice(i, i + chunkSize));
            }
            return newArray;
        },
        abrir(i, e) {
            this.marca = e.nombre;
            this.descripcionImagen = i.descripcion;
            this.imageSrc = i.ruta;
            this.rutaArchivo = i.href;
            this.srcLogo = e.logo;
            modalDetalle.show();
        },
        showZoom() {
            this.zoomVisible = true;
        },
        hideZoom() {
            this.zoomVisible = false;
        },
        moveLens(event) {
            const image = this.$refs.image;
            const lens = this.$refs.lens;
            const result = this.$refs.result;

            // Get dimensions of the image
            const rect = image.getBoundingClientRect();

            // Calculate lens position relative to the image
            const lensWidth = lens.offsetWidth;
            const lensHeight = lens.offsetHeight;
            let x = event.clientX - rect.left - lensWidth / 2;
            let y = event.clientY - rect.top - lensHeight / 2;

            // Constrain lens within image boundaries
            x = Math.max(0, Math.min(x, rect.width - lensWidth));
            y = Math.max(0, Math.min(y, rect.height - lensHeight));

            // Update lens position
            this.lensPosition.x = x;
            this.lensPosition.y = y;

            // Calculate zoomed background position for the zoom result
            const zoomX = (x / rect.width) * 100;
            const zoomY = (y / rect.height) * 100;

            this.zoomBackgroundPosition.x = zoomX;
            this.zoomBackgroundPosition.y = zoomY;
        },
        regresar() {
            document.location.assign(`${url}RedOsel/Manuales`);
        }
    },
    mounted() {
        try {
            //var a = new URL(document.location.href);
            this.idMarca = sessionStorage.getItem('idMarca');

            if (Number(this.idMarca) === 0) {
                document.location.assign(`${url}RedOsel/Manuales`);
            }

        } catch (e) {
            document.location.assign(`${url}RedOsel/Formulas`);
        }

        mainApp.getMenu().then(res => {
            mainApp.setBanner(115, 'mainBg', 'divBanner');
            this.getEquipos();
            //modalDetalle = new bootstrap.Modal(this.$refs.modalDetalle);
        }).catch(err => {
            validError(err);
        });     
    }
}).mount('#appEquipos')