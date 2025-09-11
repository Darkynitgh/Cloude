using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text.Json.Nodes;

namespace RedOsel.Controllers
{
    [Authorize]
    [EnableRateLimiting("GlobalLimiter")]
    public class CatalogosController : Controller
    {
        private readonly ILogger<AdministracionController> _logger;
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Productos()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Especificaciones()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Ciudades()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Tiendas()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Familias()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Obras()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Avisos()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Videoteca()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult ResponsabilidadSocial()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Dicopint()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Equipos()
        {
            return View();
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("/[controller]/GaleriasColor")]
        [Route("/[controller]/ArmonizaTuEntorno")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult GaleriasArmoniza()
        {
            ViewBag.Title = Request.Path.Value.ToString().Contains("Galerias") ? "Galerías de Color" : "Armoniza tu Entorno";
            ViewBag.tipo = Request.Path.Value.ToString().Contains("Galerias") ? 10 : 11;
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult ListaPrecios()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Reformulaciones()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult ProductosHomologados()
        {
            return View();
        }


        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Contenidos()
        {
            return View();
        }


        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult ClavesSistema()
        {
            return View();
        }


        #region Multimedia

        [HttpPost]
        public IActionResult TipoMultimedia_Recupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.TipoMultimedia_Recupera");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        #endregion Multimedia

        #region Claves

        [HttpPost]
        public IActionResult ClavesInserta([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Claves_Inserta");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ClavesActualiza([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Claves_Actualiza");
                if (!JObject.Parse(results)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(results)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ClavesConsulta([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Claves_Consulta");
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult ClavesRecupera([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Claves_Recupera");
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPost]
        public IActionResult TipoClaveConsulta([FromBody] JsonObject body)
        {
            try
            {
                var results = new AccesoDB(_connectionString).ExecuteQuery("dbo.TipoClave_Consulta");
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        #endregion Claves
    }
}
