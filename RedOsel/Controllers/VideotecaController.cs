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
    public class VideotecaController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IConfiguration _configuration;

        public VideotecaController(IWebHostEnvironment webHostEnvironment, IConfiguration configuration)
        {
            _webHostEnvironment = webHostEnvironment;
            _configuration = configuration;
        }


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

        [HttpPost]
        public IActionResult VideoRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Videoteca_Recupera");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult VideoInserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Videoteca_Inserta");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult VideoActualiza([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Videoteca_Actualiza");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult VideoElimina([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Videoteca_Elimina");

                if (!JObject.Parse(data)["resultado"].ToString().IsNullOrEmpty())
                {
                    throw new Exception(JObject.Parse(data)["resultado"].ToString());
                }
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

    }
}
