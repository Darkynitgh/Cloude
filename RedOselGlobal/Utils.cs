using ClosedXML.Excel;
using PdfSharp.Pdf;
using PdfSharp.Pdf.IO; // 🔹 Ensure this is present
using System.Security.Cryptography;
using System.Text;


namespace RedOselGlobal
{
    public class Utils
    {
        public static string GetPagina(dynamic httpContext)
        {
            var arrayPath = httpContext.Request.Headers["Referer"].ToString().Split("/", StringSplitOptions.RemoveEmptyEntries);
            return arrayPath[arrayPath.Length - 1];
        }

        public static int ToUnixTimestamp(DateTime dateTime)
        {
            return (int)new DateTimeOffset(dateTime).ToUnixTimeSeconds();
        }

        public static string EncrypytPassword(string password)
        {
            SHA256 sha256 = SHA256.Create();
            ASCIIEncoding encoding = new();
            byte[] stream = null;
            StringBuilder sb = new();
            stream = sha256.ComputeHash(encoding.GetBytes(password));
            for (int i = 0; i < stream.Length; i++) sb.AppendFormat("{0:x2}", stream[i]);
            return sb.ToString();
        }

        public static string GetBaseUrl(dynamic HttpContext)
        {
            var request = HttpContext.Request;

            // Use HttpRequest.Scheme and Host for constructing the base URL
            var baseUrl = $"{request.Scheme}://{request.Host.Value}";

            // Append the PathBase if the application is hosted in a virtual directory
            if (HttpContext.Request.PathBase.HasValue)
            {
                baseUrl += HttpContext.Request.PathBase.Value;
            }

            return baseUrl;
        }

        public static byte[] MergePdf(List<byte[]> pdfList)
        {
            if (pdfList == null || pdfList.Count == 0)
                return null;

            using MemoryStream outputStream = new();
            PdfDocument outputDocument = new();

            foreach (var pdfBytes in pdfList)
            {
                if (pdfBytes == null || pdfBytes.Length == 0)
                    continue;

                using MemoryStream ms = new(pdfBytes);
                using PdfDocument inputDocument = PdfReader.Open(ms, PdfDocumentOpenMode.Import);

                for (int i = 0; i < inputDocument.PageCount; i++)
                {
                    outputDocument.AddPage(inputDocument.Pages[i]);
                }
            }

            outputDocument.Save(outputStream);
            return outputStream.ToArray(); // ✅ Return merged PDF as byte array
        }

        public static byte[] MergeExcel(List<byte[]> excelFiles)
        {
            if (excelFiles == null || excelFiles.Count == 0)
                return null; // Return null or handle empty input case

            using MemoryStream outputStream = new();
            using XLWorkbook mergedWorkbook = new();
            HashSet<string> existingSheetNames = new();

            int counter = 1;
            foreach (var excelBytes in excelFiles)
            {
                if (excelBytes == null || excelBytes.Length == 0)
                    continue; // Skip empty files

                using MemoryStream ms = new(excelBytes);
                using XLWorkbook workbook = new(ms);


                foreach (var sheet in workbook.Worksheets)
                {
                    string sheetName = sheet.Name;


                    // Rename sheet if the name already exists
                    sheetName = $"Hoja_{counter}";


                    sheet.CopyTo(mergedWorkbook, sheetName);
                    existingSheetNames.Add(sheetName);
                    counter++;
                }
            }

            mergedWorkbook.SaveAs(outputStream);
            return outputStream.ToArray(); // Return merged Excel as byte arrays(outpu
        }

    }
}
