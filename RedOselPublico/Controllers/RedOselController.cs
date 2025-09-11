using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text;
using System.Text.Json.Nodes;
using System.Security.Cryptography;
using static RedOselGlobal.Models;
using System.Dynamic;


namespace RedOselPublico.Controllers
{
    [EnableRateLimiting("GlobalLimiter")]
    [Authorize]
    public class RedOselController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public RedOselController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }

        /*
        * 
        * REDOSEL - ROOT
        * 
        ***/
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Avisos()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Nosotros()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult GaleriaObras()
        {
            return View();
        }


        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult ProductosHomologados()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult ResponsabilidadSocial()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Especificaciones()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Videoteca()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult ArmonizaTuEntorno()
        {
            return View();
        }

        /*
         *      
         * FORMULAS
         * 
         * **/
        //[Route("~/Formulas/GaleriasColor")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult GaleriasColor()
        {
            return View();
        }

        //[Route("~/Formulas/Reformulaciones")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Formulas()
        {
            return View();
        }

        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Reformulaciones()
        {
            return View();
        }


        /*
        * 
        * PRECIOS
        * 
        * **/
        //[Route("~/Precios/ListaPrecios")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult ListaPrecios()
        {
            return View();
        }


        //[Route("~/Precios/ListaPrecios")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Precios()
        {
            return View();
        }

        //[Route("~/Precios/CotizadorIndustrial")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult CotizadorIndustrial()
        {
            return View();
        }

        /*
         * INFORMACION
         * 
         * **/
        ////[Route("~/Informacion/InfOsel")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult InfOsel()
        //{
        //    return View();
        //}

        ////[Route("~/Informacion/BoletinOsel")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult BoletinOsel()
        //{
        //    return View();
        //}

        ////[Route("~/Informacion//*Dicopint*/")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Dicopint()
        {
            return View();
        }


        /*
         * 
         * MANUALES
         * 
         * **/
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Manuales()
        {
            return View();
        }


        //[Route("~/Manuales/Identidad")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult Identidad()
        //{
        //    return View();
        //}

        ////[Route("~/Manuales/Curriculum")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult Curriculum()
        //{
        //    return View();
        //}

        ////[Route("~/Manuales/Politicas")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult Politicas()
        //{
        //    return View();
        //}

        ////[Route("~/Manuales/Publicidad")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult Publicidad()
        //{
        //    return View();
        //}

        //[Route("~/Manuales/Equipos")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Equipos()
        {
            return View();
        }


        /*
         * 
         *  PRODUCTOS HOMOLOGADOS
         * 
         * **/
        //[Route("~/ProductosHomologados/ProductosHomologados")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Productos()
        {
            return View();
        }

        //[Route("~/ProductosHomologados/ComparativoEmulsionadas")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult ComparativoEmulsionadas()
        {
            return View();
        }

        /*
       * 
       *  SOBRE NOSOTROS
       * 
       * **/

        //[Route("~/Nosotros/Historia")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Historia()
        {
            var js = new
            {
                idContenidoHtml = 1
            };
            var data = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.ContenidoHtml_Recupera");

            ViewBag.historia = JObject.Parse(data)["contenido"].ToString();
            return View();
        }


        //[Route("~/Nosotros/Mision")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Mision()
        {
            var js1 = new
            {
                idContenidoHtml = 2
            };
            var data = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js1), "dbo.ContenidoHtml_Recupera");

            ViewBag.mision = JObject.Parse(data)["contenido"].ToString();

            var js2 = new
            {
                idContenidoHtml = 3
            };
            var data2 = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js2), "dbo.ContenidoHtml_Recupera");

            ViewBag.vision = JObject.Parse(data2)["contenido"].ToString();

            var js3 = new
            {
                idContenidoHtml = 4
            };
            var data3 = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js3), "dbo.ContenidoHtml_Recupera");

            ViewBag.valores = JObject.Parse(data3)["contenido"].ToString();
            return View();
        }

        //[Route("~/Nosotros/Respaldo")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult Respaldo()
        {
            var js1 = new
            {
                idContenidoHtml = 5
            };
            var data = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js1), "dbo.ContenidoHtml_Recupera");

            ViewBag.respaldo = JObject.Parse(data)["contenido"].ToString();
            return View();
        }

        //[Route("~/Nosotros/GaleriaMillennium")]
        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult GaleriaMillennium()
        //{
        //    return View();
        //}


        //[AllowAnonymous]
        //[ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        //[HttpGet]
        //public IActionResult PresupuestoPublicidad()
        //{
        //    return View();
        //}


        /*
         * 
         * INFORMACIÓN COMERCIAL
         * 
         * **/

        //[Route("~/InformacionComercial/EstadosDeCuenta")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult EstadoDeCuenta()
        {
            return View();
        }

        //[Route("~/InformacionComercial/LitrosNormalizados")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult LitrosNormalizados()
        {
            return View();
        }

        //[Route("~/InformacionComercial/VentasMayoristasIndirectos")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult VentasMayoristasIndirectos()
        {
            return View();
        }

        //[Route("~/InformacionComercial/VentasMayoristasIndirectos")]
        [AllowAnonymous]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [HttpGet]
        public IActionResult EstadosPublicidad()
        {
            return View();
        }



        #region Métodos 


        #region Avisos

        [HttpPost]
        public IActionResult AvisoConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Avisos

        #region GaleriasColor

        [HttpPost]
        public IActionResult GaleriasColorConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Multimedia_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message.ToString());
            }
        }

        #endregion GaleriasColor

        #region ListaPrecios

        [HttpPost]
        public IActionResult ListaPrecioConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ListaPrecios_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion ListaPrecios

        #region Especificaciones

        [HttpPost]
        public IActionResult EspecificacionesConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Especificacion_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Especificaciones

        #region Presupuesto de Publicidad

        [HttpGet]
        public async Task<IActionResult> PresupuestoPublicidad()
        {
            try
            {
                DateTime now = DateTime.Now;
                dynamic obj = await GetDatosToken();
                var data = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(obj), "dbo.UsuariosCiac_Recupera_IdAnterior");

                int idUsuario = JObject.Parse(data)?["id_anterior"];
                //int idUsuario = 9510;
                string textoOriginal = idUsuario.ToString() + now.Year.ToString();

                string mes = new(' ', 2 - now.Month.ToString().Length);
                string mesReplace = mes.Replace(" ", "0") + now.Month.ToString();
                string segundo = new(' ', 2 - now.Second.ToString().Length);
                string segundoReplace = segundo.Replace(" ", "0") + now.Second.ToString();


                //int numMes = DateTime.Today.Month.ToString().Replace().Le;
                //int numSeg = 0;


                int numeroAleatorio = GeneraValorAleatorio();
                string textoEncriptado = String.Empty;
                textoOriginal = textoOriginal + mesReplace + segundoReplace;
                textoEncriptado = Encrypt(textoOriginal);


                string logonUrl = $"http://pinturasoselpp.com/generasesion_pp.aspx?id={numeroAleatorio}&idx={textoEncriptado}";

                //return Redirect(logonUrl);
                return Json(new { logonUrl = logonUrl, date = DateTime.Now });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #region Funciones

        public static int GeneraValorAleatorio(int? arg_segundo = null)
        {
            try
            {
                // Se incluye un valor arg_segundo, por si acaso se quiere validar ese dato en específico
                // Si no se desea utilizar el valor del argumento, entonces se calcula el valor del segundo actual en la variable segundoactual
                DateTime now = DateTime.Now;


                int diaDelMes = now.Day;
                int diaDeLaSemana = (int)now.DayOfWeek + 1; 
                int numeroDeMes = now.Month;
                int minutoActual = now.Minute;
                int segundoActual = now.Second;

                if (arg_segundo.HasValue)
                {
                    // En el caso particular de pp, se maneja con minuto en lugar de segundo...
                    minutoActual = arg_segundo.Value;
                }

                int valorAleatorio = (diaDelMes * diaDeLaSemana) + numeroDeMes;

                // Todo lo anterior más esto + (7 * minutoActual)
                valorAleatorio = valorAleatorio + (7 * minutoActual);

                // Todo lo anterior por esto * (9)
                valorAleatorio = valorAleatorio * 9;

                return valorAleatorio;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public static string Encrypt(string plainText) {
            try
            {
                string passPhrase = "osel2014xyz";
                //Dim saltValue As String = "mySaltValue"
                string saltValue = "zbB5fdh48k0pl";
                string hashAlgorithm = "SHA1";
                int passwordIterations = 2;
                string initVector = "01B2c3D4e5F6g7H8";
                int keySize = 256;

                Byte[] initVectorBytes = Encoding.ASCII.GetBytes(initVector);
                Byte[] saltValueBytes = Encoding.ASCII.GetBytes(saltValue);
                Byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
                //Dim password As New PasswordDeriveBytes(passPhrase, saltValueBytes, hashAlgorithm, passwordIterations)
                PasswordDeriveBytes password = new(passPhrase, saltValueBytes, hashAlgorithm, passwordIterations);

                Byte[] keyBytes = password.GetBytes(keySize / 8);
                RijndaelManaged symmetricKey = new();
                symmetricKey.Mode = CipherMode.CBC;
                ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes);
                MemoryStream memoryStream = new();
                CryptoStream cryptoStream = new(memoryStream, encryptor, CryptoStreamMode.Write);
                cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                cryptoStream.FlushFinalBlock();
                Byte[] cipherTextBytes = memoryStream.ToArray();
                memoryStream.Close();
                cryptoStream.Close();
                string cipherText = Convert.ToBase64String(cipherTextBytes);
                return cipherText;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }            
        }

        private Task<dynamic> GetDatosToken()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Substring(0 + "bearer".Length).Trim();
                var data = JWTUtils.GetDataFromJwt(token);

                dynamic obj = new ExpandoObject();
                obj.idUsuario = int.Parse(data["UserData"]);
                obj.nombre = data["Name"];
                obj.apellidos = data["Surname"];
                obj.perfil = data["Role"];
                obj.idPerfil = int.Parse(data["IdPerfil"]);

                return Task.FromResult<dynamic>(obj);
            }
            catch (Exception)
            {
                throw;
            }
        }



        #endregion


        #endregion

        #region ProductosHomologados

        [HttpPost]
            public IActionResult ProductosHomologadosConsulta([FromBody] JsonObject body)
            {
                try
                {
                    var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.ProductosHomologados_Consulta");
                    return Ok(data);
                }
                catch (Exception ex)
                {
                    return BadRequest(ex.Message);
                }
            }

        #endregion ProductosHomologados

        #region Reformulaciones

        [HttpPost]
        public IActionResult ReformulacionesConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Reformulacion_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Reformulaciones

        #region Videoteca

        [HttpPost]
        public IActionResult VideoConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Videoteca_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Videoteca

        #region Equipos

        [HttpPost]
        public IActionResult EquiposConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.EquipoMarca_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Equipos

        #region Dicopint

        [HttpPost]
        public IActionResult DicoConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToJsonString(), "dbo.Dicopint_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion DicoConsulta

        #region GaleriasColor

        [HttpPost]
        public IActionResult ArmonizaTuEntornoConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Multimedia_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message.ToString());
            }
        }

        #endregion GaleriasColor

        #region GaleriaObras

        [HttpPost]
        public IActionResult GaleriaDeObraConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.GaleriaObras_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion GaleriaObras

        #region ResponsabilidadSocial

        [HttpPost]
        public IActionResult ResponsabilidadSocialConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.ResponsabilidadSocial_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion ResponsabilidadSocial

        #region VentasMayoristas

        [HttpPost]
        public IActionResult GetDatosVentasMayoristas([FromBody] JsonObject body)
        {
            try
            {
                Dictionary<string, object> list = new();


                var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");

                if (JObject.Parse(res)["usuario_aux_sage"].ToString().IsNullOrEmpty())
                {
                    return BadRequest("No se puede generar reportes, avise a su administrador del sistema");
                }

                var codigoSage = JObject.Parse(res)["usuario_aux_sage"].ToString();
                var cliente = AccesoDB.GetCliente(codigoSage);

                if (cliente.Cliente.IsNullOrEmpty())
                {
                    return BadRequest("Error en información del cliente");
                }

                list.Add("cliente", cliente);

                var semestres = AccesoDB.GetSemestre();
                if (semestres.Estatus.Equals(0))
                {
                    return BadRequest("Error en datos del semestre, avise al administrador del sistema");
                }
                list.Add("semestres", semestres);


                var distribuidoresIndirectos = AccesoDB.GetDistribuidores(codigoSage);
                if (distribuidoresIndirectos.Count.Equals(0))
                {
                    return BadRequest("No tiene distbuidores indirectos asociados");
                }
                list.Add("distribuidoresIndirectos", distribuidoresIndirectos);


                var detallePartidasDistribuidores = AccesoDB.GetDetalleCapturasDistribuidores(semestres.Id, codigoSage);
                list.Add("detallePartidasDistribuidores", detallePartidasDistribuidores);

                if (detallePartidasDistribuidores.Count > 0)
                {
                    var detallePartidasPrimerDistribuidor = AccesoDB.GetDetalleCapturasDistribuidor(semestres.Id, codigoSage, detallePartidasDistribuidores[0].CveDistribuidor);
                    list.Add("detallePartidasPrimerDistribuidor", detallePartidasPrimerDistribuidor);
                }

                return Json(list);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetCapturasDistribuidor([FromBody] JsonObject body)
        {
            try
            {
                int idSemestre = int.Parse(body["idSemestre"].ToString());
                string codigoSage = body["codigoSage"].ToString();
                string claveDistribuidor = body["claveDistribuidor"].ToString();


                var detallePartidasDistribuidores = AccesoDB.GetDetalleCapturasDistribuidores(idSemestre, codigoSage);
                var detalleDistribuidor = AccesoDB.GetDetalleCapturasDistribuidor(idSemestre, codigoSage, claveDistribuidor);
                return Json(new
                {
                    detalleDistribuidor,
                    detallePartidasDistribuidores
                });
            }
            catch (Exception)
            {

                throw;
            }
        }

        [HttpPost]
        public IActionResult GetCapturasDistribuidores([FromBody] JsonObject body)
        {
            try
            {
                int idSemestre = int.Parse(body["idSemestre"].ToString());
                string codigoSage = body["codigoSage"].ToString();

                var detalleDistribuidor = AccesoDB.GetDetalleCapturasDistribuidores(idSemestre, codigoSage);
                return Json(detalleDistribuidor);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CapturasDistribuidorInserta([FromBody] JsonObject body)
        {
            try
            {
                int idSemestre = int.Parse(body["idSemestre"].ToString());
                string codigoSage = body["codigoSage"].ToString();
                string claveDistribuidor = body["claveDistribuidor"].ToString();
                string anio = body["anioMes"].ToString().Split("/")[0];
                string mes = body["anioMes"].ToString().Split("/")[1];
                float venta = float.Parse(body["venta"].ToString());

                await AccesoDB.CapturaDistribuidoresIndirectosInserta(idSemestre, codigoSage, claveDistribuidor, anio, mes, venta);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CapturasDistribuidorElimina([FromBody] JsonObject body)
        {
            try
            {
                int idCaptura = int.Parse(body["idCaptura"].ToString());

                await AccesoDB.CapturaDistribuidoresIndirectosElimina(idCaptura);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion VentasMayoristas

        #region CotizadorIndustrial

        [HttpPost]
        public IActionResult GetFamilias()
        {
            try
            {
                var familias = AccesoDB.GetFamilias();
                return Ok(familias);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetColores([FromBody] JsonObject body)
        {
            try
            {
                string familia = body["familia"].ToString();
                string linea = body["linea"].ToString();

                var colores = AccesoDB.GetColoresIndustriales(familia, linea);
                return Ok(colores);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult GetDetalleCotizador([FromBody] JsonObject body)
        {
            try
            {
                string linea = body["linea"].ToString();
                string color = body["color"].ToString();

                var cotizador = AccesoDB.GetDetalleCotizador(linea, color);
                return Ok(cotizador);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        #endregion CotizadorIndustrial

        #region REPORTES

        [HttpPost]
        public async Task<IActionResult> EstadosCuenta([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");

                if (JObject.Parse(res)["usuario_aux_sage"].ToString().IsNullOrEmpty())
                {
                    return BadRequest("No se puede generar reportes, avise a su administrador del sistema");
                }

                var par = new Dictionary<string, string>
                {
                    { "Cliente", JObject.Parse(res)["usuario_aux_sage"].ToString() },
                    { "tipo", "1" }
                };

                var reportPESOS = await Reportes.ExecuteReportAsync(
                    nombreReporte: _configuration.GetSection("Reportes:InformacionComercial").Value,
                    listaParametros: par,
                    tipo: int.Parse(body["tipo"].ToString())
                    );

                var par2 = new Dictionary<string, string>
                {
                    { "Cliente", JObject.Parse(res)["usuario_aux_sage"].ToString() },
                    { "tipo", "2" }
                };

                var reportUSD = await Reportes.ExecuteReportAsync(
                    nombreReporte: _configuration.GetSection("Reportes:InformacionComercial").Value,
                    listaParametros: par2,
                    tipo: int.Parse(body["tipo"].ToString())
                    );

                var list = new List<byte[]>
                {
                    reportPESOS,
                    reportUSD
                };

                dynamic report;

                if (int.Parse(body["tipo"].ToString()).Equals(1))
                {
                    report = Utils.MergePdf(list);
                }
                else
                {
                    report = Utils.MergeExcel(list);
                }

                return File(
                    report,
                    int.Parse(body["tipo"].ToString()).Equals(1) ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> LitrosNormalizados([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");

                if (JObject.Parse(res)["usuario_aux_sage"].ToString().IsNullOrEmpty())
                {
                    return BadRequest("No se puede generar reportes, avise a su administrador del sistema");
                }

                var par = new Dictionary<string, string>
                {
                    { "Cliente", JObject.Parse(res)["usuario_aux_sage"].ToString() }
                };

                var report = await Reportes.ExecuteReportAsync(
                    nombreReporte: _configuration.GetSection("Reportes:LitrosNormalizados").Value,
                    listaParametros: par,
                    tipo: int.Parse(body["tipo"].ToString())
                    );

                return File(
                    report,
                    int.Parse(body["tipo"].ToString()).Equals(1) ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CapturaMayoristas([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");

                if (JObject.Parse(res)["usuario_aux_sage"].ToString().IsNullOrEmpty())
                {
                    return BadRequest("No se puede generar reportes, avise a su administrador del sistema");
                }

                var par = new Dictionary<string, string>
                {
                    { "Cliente", body["nombre"].ToString() },
                    { "Id", body["idSemestre"].ToString() },
                    { "CveMay", body["codigoSage"].ToString() }
                };

                var report = await Reportes.ExecuteReportAsync(
                    nombreReporte: _configuration.GetSection("Reportes:CapturaMayoristas").Value,
                    listaParametros: par,
                    tipo: int.Parse(body["tipo"].ToString())
                    );

                return File(
                    report,
                    int.Parse(body["tipo"].ToString()).Equals(1) ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> EstadosPublicidad([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");

                if (JObject.Parse(res)["usuario_aux_sage"].ToString().IsNullOrEmpty())
                {
                    return BadRequest("No se puede generar reportes, avise a su administrador del sistema");
                }

                var par = new Dictionary<string, string>
                {
                    { "Cliente", JObject.Parse(res)["usuario_aux_sage"].ToString() }
                };

                var report = await Reportes.ExecuteReportAsync(
                    nombreReporte: _configuration.GetSection("Reportes:EstadosPublicidad").Value,
                    listaParametros: par,
                    tipo: int.Parse(body["tipo"].ToString())
                    );

                return File(
                    report,
                    int.Parse(body["tipo"].ToString()).Equals(1) ? "application/pdf" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    );
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion REPORTES

        #endregion Métodos
    }
}
