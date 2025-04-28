using AutoMapper;
using CoCall.Data.DTOs;
using CoCall.Data.Models;

namespace CoCall.API
{
    public class MappingProfile: Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>();
        }
    }
}
