﻿using Dnn.PersonaBar.Prompt.Models;
using DotNetNuke.Common.Utilities;
using DotNetNuke.Entities.Users;
using DotNetNuke.Security.Roles;
using DotNetNuke.Services.Exceptions;
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace Dnn.PersonaBar.Prompt
{
    public class Utilities
    {
        public static void AddToRoles(int UserId, int PortalId, string RoleNames, string RoleDelimiter = ",", DateTime? EffectiveDate = null, DateTime? ExpiryDate = null)
        {
            DateTime effDate = EffectiveDate.GetValueOrDefault(Null.NullDate);
            DateTime expDate = ExpiryDate.GetValueOrDefault(Null.NullDate);
            
            // get the specified RoleName
            RoleController rc = new RoleController();
            string[] lstRoles = RoleNames.Split(RoleDelimiter.ToCharArray());
            RoleInfo role = default(RoleInfo);
            string curRole = null;
            for (int i = 0; i <= lstRoles.Length - 1; i++)
            {
                curRole = lstRoles[i].Trim();
                role = rc.GetRoleByName(PortalId, curRole);
                if ((role != null))
                {
                    rc.AddUserRole(PortalId, UserId, role.RoleID, effDate, expDate);
                }
            }
        }

        public static List<UserRoleModel> GetUserRoles(UserInfo user)
        {
            var roles = RoleController.Instance.GetUserRoles(user, true);
            List<UserRoleModel> lst = new List<UserRoleModel>();
            foreach (UserRoleInfo userRole in roles)
            {
                lst.Add(UserRoleModel.FromDnnUserRoleInfo(userRole));
            }
            return lst;
        }

        public static RoleInfo CreateRole(string roleName, int portalId, RoleStatus status, string description = "", bool isPublic = false, bool autoAssign = false, int roleGroupId = -1)
        {
            var ri = new RoleInfo
            {
                RoleName = roleName,
                Description = description,
                PortalID = portalId,
                IsPublic = isPublic,
                AutoAssignment = autoAssign,
                Status = status,
                RoleGroupID = roleGroupId,
                SecurityMode = SecurityMode.SecurityRole
            };

            var newRoleId = RoleController.Instance.AddRole(ri);

            return RoleController.Instance.GetRoleById(portalId, newRoleId);
        }

        public static RoleInfo UpdateRole(RoleInfo role)
        {
            RoleController.Instance.UpdateRole(role);
            return GetRoleById(role.RoleID, role.PortalID);
        }

        public static RoleInfo GetRoleById(int roleId, int portalId)
        {
            return RoleController.Instance.GetRoleById(portalId, roleId);
        }

        public static bool RoleExists(string roleName, int portalId)
        {
            var ri = RoleController.Instance.GetRoleByName(portalId, roleName);
            return ri != null;
        }

        public static IList<UserInfo> GetUsersInRole(string roleName, int portalId)
        {
            return RoleController.Instance.GetUsersByRole(portalId, roleName);
        }

        public static string SendSystemEmail(UserInfo user, DotNetNuke.Services.Mail.MessageType msgType, DotNetNuke.Entities.Portals.PortalSettings ps)
        {
            string msg = string.Empty;
            try
            {
                msg = DotNetNuke.Services.Mail.Mail.SendMail(user, msgType, ps);
            }
            catch (Exception ex)
            {
                // On some systems, if DNN has sent an email and the SMTP connection is still open, 
                // no other email can be sent until that connection times out. When that happens a transport error is thrown
                // but it seems to close the connection at that point. So, retrying after the exception always (in my tests) 
                // results in the email being sent on the 2nd go-round.
                // try again.
                try
                {
                    msg = DotNetNuke.Services.Mail.Mail.SendMail(user, msgType, ps);
                }
                catch (Exception ex2)
                {
                    Exceptions.LogException(ex2);
                }
            }
            return msg;
        }

        public static string FormatSkinName(string skin)
        {
            if (string.IsNullOrEmpty(skin))
                return skin;
            var match = Regex.Match(skin, "skins\\/(\\w*)\\/(.*)\\.ascx", RegexOptions.IgnoreCase);
            if (match.Success)
            {
                return string.Format("{0} ({1})", match.Groups[1].Value, match.Groups[2].Value);
            }
            else
            {
                return skin;
                // unable to find a match
            }
        }

        public static string FormatContainerName(string container)
        {
            if (string.IsNullOrEmpty(container))
                return container;
            Regex r = new Regex("containers\\/(\\w*)\\/(.*)\\.ascx", RegexOptions.IgnoreCase);
            Match match = r.Match(container);
            if (match.Success)
            {
                return string.Format("{0} ({1})", match.Groups[1].Value, match.Groups[2].Value);
            }
            else
            {
                return container;
                // unable to find a match
            }
        }

        public static VersionInfo GetDNNVersion()
        {
            System.Version ver = System.Reflection.Assembly.GetAssembly(typeof(DotNetNuke.Common.Globals)).GetName().Version;
            VersionInfo retVer = new VersionInfo();
            if (ver != null)
            {
                var _with1 = retVer;
                _with1.Major = ver.Major;
                _with1.Minor = ver.Minor;
                _with1.Build = ver.Build;
                _with1.Revision = ver.Revision;
            }
            else
            {
                var _with2 = retVer;
                _with2.Major = 0;
                _with2.Minor = 0;
                _with2.Build = 0;
                _with2.Revision = 0;
            }
            return retVer;
        }
    }
}


