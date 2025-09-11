
namespace RedOselGlobal
{
    public class Models
    {
        public class Opciones
        {
            public int id_opcion { get; set; }
            public string descripcion { get; set; }
            public string controller { get; set; }
            public string pagina { get; set; }
            public int id_estatus { get; set; }
            public int id_opcion_padre { get; set; }
            public string mensaje { get; set; }
            public string icono { get; set; }
            public int acceso { get; set; }
            public List<Opciones> listaOpciones { get; set; }
        }

        public class Perfil
        {
            public int id_perfil { get; set; }
            public string perfil { get; set; }
            public string mensaje { get; set; }
            public string id_estatus { get; set; }
            public string estatus { get; set; }
        }

        public class Claves
        {
            public int id_clave { get; set; }
            public string cadena { get; set; }
            public int id_tipo_clave { get; set; }
            public string mensaje { get; set; }
            public string fondo { get; set; }
            public string icono { get; set; }
        }

        public class Usuarios
        {
            public int id_usuario { get; set; }
            public string usuario { get; set; }
            public string nombre { get; set; }
            public string apellidos { get; set; }
            public string contrasena { get; set; }
            public string correo_electronico { get; set; }
            public int id_estatus { get; set; }
            public int id_perfil { get; set; }
            public string token_recupera_contrasena { get; set; }
            public string mensaje { get; set; }
            public string estatus { get; set; }
            public int solicitud_recuperar_contrasena { get; set; }
            public string perfil { get; set; }
            public string telefono { get; set; }
            public int id_estatus_perfil { get; set; }
        }

        public class Pedidos
        {
            public class Colores
            {
                public string Codigo { get; set; } = string.Empty;
                public string Descripcion { get; set; } = string.Empty;
            }

            public string Linea { get; set; } = string.Empty;
            public string Familia { get; set; } = string.Empty;

            public class PedidosAgua
            {
                public string CodigoBaseGal { get; set; } = string.Empty;
                public string DescripcionBG { get; set; } = string.Empty;
                public double PrecioDBG { get; set; }
                public double PrecioPBG { get; set; }
                public int ProporcionBaseG { get; set; }
                public string CodigoCatalizadorGal { get; set; } = string.Empty;
                public string DescripcionCG { get; set; } = string.Empty;
                public double PrecioDCG { get; set; }
                public double PrecioPCG { get; set; }
                public int ProporcionCatalizadorG { get; set; }
                public string CodigoBaseCub { get; set; } = string.Empty;
                public string DescripcionBQ { get; set; } = string.Empty;
                public double PrecioDBQ { get; set; }
                public double PrecioPBQ { get; set; }
                public int ProporcionBaseQ { get; set; }
                public string CodigoCatalizadorCub { get; set; } = string.Empty;
                public string DescripcionCQ { get; set; } = string.Empty;
                public double PrecioDCQ { get; set; }
                public double PrecioPCQ { get; set; }
                public int ProporcionCatalizadorQ { get; set; }
            }

            public class PedidosSolventes
            {
                public int Id { get; set; }
                public string Color { get; set; } = string.Empty;
                public string Nombre { get; set; } = string.Empty;
                public string DescripcionColor { get; set; } = string.Empty;
                public string CodigoBaseGal { get; set; } = string.Empty;
                public string DescripcionBG { get; set; } = string.Empty;
                public double PrecioDBG { get; set; }
                public double PrecioPBG { get; set; }
                public string CodigoCatalizadorGal { get; set; } = string.Empty;
                public string DescripcionCG { get; set; } = string.Empty;
                public double PrecioDCG { get; set; }
                public double PrecioPCG { get; set; }
                public int ProporcionSolvG { get; set; }
                public int ProporcionColoranteG { get; set; }
                public string CodigoBaseCub { get; set; } = string.Empty;
                public string DescripcionBQ { get; set; } = string.Empty;
                public double? PrecioDBQ { get; set; }
                public double? PrecioPBQ { get; set; }
                public string CodigoCatalizadorCub { get; set; } = string.Empty;
                public string DescripcionCQ { get; set; } = string.Empty;
                public double? PrecioDCQ { get; set; }
                public double? PrecioPCQ { get; set; }
                public int ProporcionSolvQ { get; set; }
                public int ProporcionColoranteQ { get; set; }
                public double PrecioDColoranteGal { get; set; }
                public double PrecioDColoranteCub { get; set; }
                public double PrecioPColoranteGal { get; set; }
                public double PrecioPColoranteCub { get; set; }
                public string CodigoSolvente { get; set; } = string.Empty;
                public string DescripcionS { get; set; } = string.Empty;
                public double PrecioSD { get; set; }
                public double PrecioSP { get; set; }
                public int Status { get; set; }
                public string Familia { get; set; } = string.Empty;
                public int IdGaleria { get; set; }
                public int IdResina { get; set; }
                public string FormulaG { get; set; } = string.Empty;
                public string FormulaQ { get; set; } = string.Empty;
                public string FormulaQ18 { get; set; } = string.Empty;
                public string CodigoBaseCub18 { get; set; } = string.Empty;
                public string DescripcionBQ18 { get; set; } = string.Empty;
                public double PrecioDBQ18 { get; set; }
                public double PrecioPBQ18 { get; set; }
                public string CodigoCatalizadorCub18 { get; set; } = string.Empty;
                public string DescripcionCQ18 { get; set; } = string.Empty;
                public double PrecioDCQ18 { get; set; }
                public double PrecioPCQ18 { get; set; }
                public int ProporcionSolvQ18 { get; set; }
                public int ProporcionColoranteQ18 { get; set; }


            }

            public class DatosPresupuesto
            {
                public string Cliente { get; set; } = "";
                public int Id { get; set; }
                public string IdSemestre { get; set; } = string.Empty;
                public string CveMayorista { get; set; } = string.Empty;
                public string CveDistribuidor { get; set; } = string.Empty;
                public string Nombre { get; set; } = string.Empty;
                public int Anio { get; set; }
                public int Mes { get; set; }
                public decimal Venta { get; set; }
                public decimal VentaInicial { get; set; }
                public decimal LitrosNormalizados { get; set; }
                public decimal LitrosNormalizadosInicial { get; set; }
                public int AnioInicial { get; set; }
                public int MesInicial { get; set; }
                public int AnioFinal { get; set; }
                public int MesFinal { get; set; }
                public string Descripcion { get; set; } = "";
                public int Estatus { get; set; }
                public string FechaInicial { get; set; } = "";
                public string FechaFinal { get; set; } = "";
            }
        }
    }
}
