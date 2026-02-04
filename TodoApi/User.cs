using System;
using System.Collections.Generic;

namespace TodoApi;


public class User
{
    public int IdUsers { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}