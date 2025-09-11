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
    public class EspecificacionesController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public EspecificacionesController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }

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

        [HttpPost]
        public IActionResult EspecificacionesRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Especificacion_Recupera");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult EspecificacionesInserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Especificacion_Inserta");
                if (int.TryParse(JObject.Parse(data)["resultado"].ToString(), out int idEspecificacion))
                {
                    return Ok(idEspecificacion);
                }
                else
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult EspecificacionesActualiza([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Especificacion_Actualiza");
                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult EspecificacionesElimina([FromBody] JsonObject body)
        {
            try
            {
                var dataEspecificacion = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Especificacion_Recupera");

                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Especificacion_Elimina");
                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var array = JArray.Parse(JObject.Parse(dataEspecificacion)["multimedia"].ToString());
                var ruta = _webHostEnvironment.WebRootPath;
                if (array.Count > 0)
                {
                    foreach (var item in array)
                    {
                        var directorioYArchivo = Path.Combine(_configuration.GetValue<string>("Rutas:Multimedia"), item["id_tipo_multimedia"].ToString(), item["archivo"].ToString());

                        try
                        {

                            System.IO.File.Delete(ruta + directorioYArchivo);
                        }
                        catch (Exception)
                        {
                            //
                        }
                    }
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
