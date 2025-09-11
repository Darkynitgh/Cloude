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
    public class AvisosController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;


        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public AvisosController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }



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

        [HttpPost]
        public IActionResult AvisoRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Recupera");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult AvisoInserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Inserta");
                if (int.TryParse(JObject.Parse(data)["resultado"].ToString(), out int idObra))
                {
                    return Ok(idObra);
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
        public IActionResult AvisoActualiza([FromBody] JsonObject body)
        {
            try
            {
                if (bool.Parse(body["link"].ToString()))
                {
                    var dataObra = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Recupera");

                    var array = JArray.Parse(JObject.Parse(dataObra)["multimedia"].ToString());
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
                }

                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Actualiza");
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
        public IActionResult AvisoElimina([FromBody] JsonObject body)
        {
            try
            {

                var dataObra = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Recupera");

                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Avisos_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }

                var array = JArray.Parse(JObject.Parse(dataObra)["multimedia"].ToString());
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
