


Vue.createApp({
    data() {
        return {};
    },
    methods: {

        //chooseEvent(item) {
        //    if (item.id_opcion === 111) {
        //        return this.mostrar(1);
        //    }
        //    if (item.id_opcion === 115) {
        //        return this.mostrar(2);
        //    }
        //},
        urlImage(item) {
            return `${url}imagenes/manuales/${item.banner_pagina}`;
        },
        urlContent(item) {
            return `${url}${item.url_destino}`;
        },
        formatHtml(item) {
            if (item.id_opcion === 116) {
                return item.descripcion;
            }
            if (item.id_opcion === 103){
                return "Cotizador<br/>Industrial";
            }
            if (item.id_opcion === 104) {
                return "Folleto y <br/>Promociones";
            }
        },
        target(item) {
            return item.id_opcion !== 104 ? '_self' : '_blank';
        }
    },
    computed: {
        menu() {
            return mainApp.array?.recursos?.filter((item) => item.id === 97)?.[0]?.esferas;
        }
    },
    mounted() {
        //mainApp.getMenu().then(res => {
        //    mainApp.setBanner(90, 'mainBg', 'divBanner');
        //    this.getMarcas();
        //    modalEquipos = new bootstrap.Modal(this.$refs.modalEquipos, {
        //        keyboard: false
        //    })
        //}).catch(err => {
        //    validError(err);
        //});
        mainApp.getMenu().then(res => {
            mainApp.setBanner(97, 'mainBg', 'divBanner');
        }).catch(err => {
            validError(err);
        });

    }
}).mount('#appPrecios');

