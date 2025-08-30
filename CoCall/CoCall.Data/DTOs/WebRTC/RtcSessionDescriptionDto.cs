using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CoCall.Data.DTOs.WebRTC
{
    public class RtcSessionDescriptionDto
    {
        [JsonPropertyName("type")] 
        public string Type { get; set; } = default!; // "offer" | "answer"

        [JsonPropertyName("sdp")] 
        public string Sdp { get; set; } = default!;
    }
}
