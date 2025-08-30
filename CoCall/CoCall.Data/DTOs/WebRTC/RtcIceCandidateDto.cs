using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CoCall.Data.DTOs.WebRTC
{
    public class RtcIceCandidateDto
    {
        [JsonPropertyName("candidate")] 
        public string Candidate { get; set; } = default!;

        [JsonPropertyName("sdpMid")] 
        public string? SdpMid { get; set; }

        [JsonPropertyName("sdpMLineIndex")] 
        public int? SdpMLineIndex { get; set; }
    }
}
