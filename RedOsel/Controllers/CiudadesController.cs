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
    public class CiudadesController : Controller
    {
        private readonly ILogger<AdministracionController> _logger;
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;


        [HttpPost]
        public IActionResult CiudadesConsulta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Ciudades_Consulta");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult CiudadesRecupera([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Ciudades_Recupera");
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult CiudadesInserta([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Ciudades_Inserta");
                if (int.TryParse(JObject.Parse(data)["resultado"].ToString(), out int idCiudad))
                {
                    return Ok(idCiudad);
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
        public IActionResult CiudadesActualiza([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Ciudades_Actualiza");
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
        public IActionResult CiudadesElimina([FromBody] JsonObject body)
        {
            try
            {
                var data = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.Ciudades_Elimina");
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
    }
}
