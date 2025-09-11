using ReportExecution;
using System.ServiceModel;

namespace RedOselGlobal
{
    public class Reportes
    {
        /// <summary>
        /// EJECUTA REPORTE DE SQL REPORTING SERVICES SIN GUARDARLO
        /// </summary>
        /// <param name="nombreCarpeta"></param>
        /// <param name="nombreReporte"></param>
        /// <param name="listaParametros"></param>
        /// <param name="user"></param>
        /// <param name="password"></param>
        /// <param name="rutaServidorReportes"></param>
        /// <param name="nombreReporteEjecutado"></param>
        /// <param name="tipo"></param>
        /// <returns>
        /// REGRESA SOLO UN ARREGLO DE BYTES Y NO GUARDA EL REPORTE EN DISCO DURO
        /// </returns>
        public static async Task<byte[]> ExecuteReportAsync(string nombreReporte, Dictionary<string, string> listaParametros, int tipo = 1)
        {
            try
            {
                // Define the binding
                var binding = new BasicHttpBinding(BasicHttpSecurityMode.TransportCredentialOnly)
                {
                    Security = { Transport = { ClientCredentialType = HttpClientCredentialType.Ntlm } },
                    MaxReceivedMessageSize = 21474836, // Tamaño máximo del reporte a recibir aceptado, ACTUAL: 21 Mb
                    // Set timeout properties
                    SendTimeout = TimeSpan.FromMinutes(10),    // The time allowed for sending the request
                    ReceiveTimeout = TimeSpan.FromMinutes(10), // The time allowed for receiving the response
                    OpenTimeout = TimeSpan.FromMinutes(10),    // The time allowed to establish the connection
                    CloseTimeout = TimeSpan.FromMinutes(10)
                };

                string nombreCarpeta = Environment.GetEnvironmentVariable("CarpetaReportes");
                string rutaServidorReportes = Environment.GetEnvironmentVariable("RutaServidorReportes");
                var endpointAddress = new EndpointAddress(new Uri($"{rutaServidorReportes}/reportexecution2005.asmx"));
                var client = new ReportExecutionServiceSoapClient(binding, endpointAddress);

                // Set the credentials for the service
                /*
                 * 
                 *  LA APLICACIÓN WEB TOMA EL USUARIO COMO EL APP POOL ASIGNADO A LA APLICACIÓN
                 * 
                 * */
                client.ClientCredentials.UserName.UserName = "Intelimatica63";
                client.ClientCredentials.UserName.Password = "Proyectos63";

                // Ensure pre-authentication is enabled
                client.ClientCredentials.Windows.AllowedImpersonationLevel = System.Security.Principal.TokenImpersonationLevel.Impersonation;

                try
                {
                    // Load the report 
                    string reportPath = $"/{nombreCarpeta}/{nombreReporte}";
                    // Create the TrustedUserHeader
                    var trustedUserHeader = new TrustedUserHeader() { UserName = Environment.GetEnvironmentVariable("LocalAccountName") };
                    var loadReportResponse = await client.LoadReportAsync(trustedUserHeader, reportPath, null);

                    string executionId = loadReportResponse.executionInfo.ExecutionID;
                    var executionHeader = new ExecutionHeader { ExecutionID = executionId };

                    // ASIGNA PARAMETROS SÍ APLICA
                    if (listaParametros.Count > 0)
                    {
                        // Set report parameters if needed
                        ParameterValue[] parameters = new ParameterValue[listaParametros.Count];

                        int count = 0;
                        foreach (var param in listaParametros)
                        {
                            parameters[count] = new ParameterValue()
                            {
                                Label = param.Key,
                                Name = param.Key,
                                Value = param.Value
                            };
                            count++;
                        }

                        await client.SetExecutionParametersAsync(executionHeader, trustedUserHeader, parameters, "en-us");
                    }

                    // Render the report to a specific format (e.g., PDF)
                    string format = tipo switch
                    {
                        1 => "PDF",
                        2 => "EXCELOPENXML",
                        3 => "WORDOPENXML",
                        _ => "PDF",
                    };
                    string deviceInfo = "<DeviceInfo><Toolbar>False</Toolbar></DeviceInfo>";

                    // Set RenderRequest data
                    var renderRequest = new RenderRequest
                    {
                        Format = format, // Could be "PDF", "EXCEL", "WORD", etc.
                        DeviceInfo = deviceInfo,
                        ExecutionHeader = executionHeader,
                        TrustedUserHeader = trustedUserHeader,
                    };


                    // EXECUTE THE REPORT WITH PARAMETERS ADDED (IF APPLY)
                    var resultRender = await client.RenderAsync(renderRequest);
                    return resultRender.Result;
                }
                catch (Exception)
                {
                    throw;
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

    }
}
