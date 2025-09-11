using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews().AddRazorRuntimeCompilation();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{  // Token validation parameters
    options.TokenValidationParameters = new TokenValidationParameters
    {
        // Validate issuer to ensure token is from a trusted source
        ValidateIssuer = true,
        ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"), // The trusted issuer (usually the Identity Provider URL)

        // Validate audience to ensure token is intended for your app
        ValidateAudience = true,
        ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"), // The intended recipient (usually your app's API or client)

        // Validate token lifetime to ensure it's not expired
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        // Handle expired tokens by setting a clock skew (e.g., 5 minutes)
        //ClockSkew = TimeSpan.FromMinutes(1),

        // The key used to sign the JWT, which must match the key used by your Identity Provider
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"))),

        // Optional: Allow some leeway for expiration time
        RequireExpirationTime = true,
        RequireAudience = true,
        RequireSignedTokens = true
    };

    // Optional: Additional performance optimizations, such as enabling caching of validated tokens
    options.SaveToken = false;
    options.RequireHttpsMetadata = bool.Parse(Environment.GetEnvironmentVariable("JWT_REQUIRED_HTTPS"));
});



if (builder.Environment.IsProduction())
{
    builder.Services.AddHttpsRedirection(options =>
    {
        options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
        options.HttpsPort = 443;
    });
}



// RATE LIMT FOR APIS
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("GlobalLimiter", policy =>
    {
        policy.Window = TimeSpan.FromMinutes(1); // 1-minute window
        policy.PermitLimit = builder.Environment.EnvironmentName.Equals("Development") ? int.Parse(Environment.GetEnvironmentVariable("RateLimitDevelopment") ?? "9999") : int.Parse(Environment.GetEnvironmentVariable("RateLimitProduction") ?? "1000");               // Allow 250 requests per minute
        policy.QueueLimit = 0;                 // Allow 10 requests to queue
        policy.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });


    options.OnRejected = (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.Headers["Retry-After"] = "60"; // Retry after 60 seconds
        return ValueTask.CompletedTask;
    };
});


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

if (app.Environment.IsProduction())
{
    app.UseHttpsRedirection();
}

app.UseRouting();
app.UseRateLimiter();

app.Use(async (context, next) =>
{
    // Check if the current request endpoint has the AllowAnonymous attribute
    var endpoint = context.GetEndpoint();
    var allowAnonymousAttribute = endpoint?.Metadata.GetMetadata<IAllowAnonymous>();

    if (context.Request.Method == "POST")
    {
        if (allowAnonymousAttribute != null)
        {
            // The endpoint has the AllowAnonymous attribute applied
            // Perform any necessary actions for unauthenticated requests
            //context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
            await next.Invoke(); // Continue processing the request pipeline
        }
        else
        {
            string GetPagina(HttpContext httpContext)
            {
                var arrayPath = httpContext.Request.Headers["Referer"].ToString().Split("/", StringSplitOptions.RemoveEmptyEntries);
                var a = arrayPath.Reverse().Take(2).Reverse().ToArray();
                return string.Join("/", a);
            }

            string token = string.Empty;

            try
            {
                token = context?.Request?.Headers?["Authorization"].ToString()?.Substring(0 + "bearer".Length).Trim();
            }
            catch (Exception)
            {
                //
            }

            if (string.IsNullOrEmpty(token))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                //context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                context.Response.ContentType = "application/json";

                context.Response.Headers.Remove("WWw-Authenticate");
                context.Response.Headers.Remove("WWW-Authenticate");

                await context.Response.WriteAsync(JsonConvert.SerializeObject(new
                {
                    error = "Unauthorized",
                    message = "Token is invalid or expired."
                }));
            }

            var dataJwt = new Dictionary<string, string>();
            int idUsuario = 0;
            bool pass = true;
            try
            {
                dataJwt = JWTUtils.GetDataFromJwt(token);
                idUsuario = int.Parse(dataJwt["UserData"]);
            }
            catch (Exception)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                //context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                context.Response.ContentType = "application/json";

                context.Response.Headers.Remove("WWw-Authenticate");
                context.Response.Headers.Remove("WWW-Authenticate");

                await context.Response.WriteAsync(JsonConvert.SerializeObject(new
                {
                    error = "Unauthorized",
                    message = "Token is invalid or expired."
                }));
            }


            var pagina = GetPagina(context);
            if (pagina.IndexOf("?") != -1)
            {
                pagina = pagina.Split("?")[0];
            }

            var json = new
            {
                idUsuario,
                pagina = pagina.Split("/")[^1],
                esDistribuidores = 1
            };
            var result = await new AccesoDB(Environment.GetEnvironmentVariable("ConnectionString")).ExecuteQueryAsync(JsonConvert.SerializeObject(json), "dbo.Usuario_ValidacionSesion");


            pass = int.Parse(JObject.Parse(result)["valido"].ToString()).Equals(1);
            if (pass)
            {
                // User is authenticated, continue processing the request pipeline
                //context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                await next.Invoke();
            }
            else
            {
                // Access denied, return a 401 Unauthorized response
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                //context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
                context.Response.ContentType = "application/json";

                context.Response.Headers.Remove("WWw-Authenticate");
                context.Response.Headers.Remove("WWW-Authenticate");

                await context.Response.WriteAsync(JsonConvert.SerializeObject(new
                {
                    error = "Unauthorized",
                    message = "Token is invalid or expired."
                }));
            }
        }
    }
    else
    {
        // Continue processing the request pipeline
        //context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
        await next.Invoke();
    }
});

app.UseAuthentication();
app.UseAuthorization();

app.UseStaticFiles();

//app.UseStaticFiles(new StaticFileOptions
//{
//    FileProvider = new PhysicalFileProvider(Environment.GetEnvironmentVariable("AlterFolderStaticFiles")),
//    RequestPath = Environment.GetEnvironmentVariable("UrlRoute"), // URL path
//    ServeUnknownFileTypes = true, // Optional: allow unknown MIME types
//    DefaultContentType = "application/octet-stream" // Optional
//});

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Inicio}/{action=Inicio}/{id?}");


app.Run();
