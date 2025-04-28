using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CoCall.API.Migrations
{
    /// <inheritdoc />
    public partial class updateRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserName",
                keyValue: "janedoe");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserName",
                keyValue: "johndoe");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "UserName",
                keyValue: "johnsmith");

            migrationBuilder.AlterColumn<int>(
                name: "CallerId",
                table: "VideoCalls",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "CalleeId",
                table: "VideoCalls",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "Id",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0)
                .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "SenderId",
                table: "TextChatMessages",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "ReceiverId",
                table: "TextChatMessages",
                type: "int",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "TextChatMessages",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "Id");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "Name", "UserName" },
                values: new object[,]
                {
                    { 1, "John Doe", "johndoe" },
                    { 2, "Jane Doe", "janedoe" },
                    { 3, "John Smith", "johnsmith" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_VideoCalls_CalleeId",
                table: "VideoCalls",
                column: "CalleeId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoCalls_CallerId",
                table: "VideoCalls",
                column: "CallerId");

            migrationBuilder.CreateIndex(
                name: "IX_TextChatMessages_ReceiverId",
                table: "TextChatMessages",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_TextChatMessages_SenderId",
                table: "TextChatMessages",
                column: "SenderId");

            migrationBuilder.AddForeignKey(
                name: "FK_TextChatMessages_Users_ReceiverId",
                table: "TextChatMessages",
                column: "ReceiverId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_TextChatMessages_Users_SenderId",
                table: "TextChatMessages",
                column: "SenderId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VideoCalls_Users_CalleeId",
                table: "VideoCalls",
                column: "CalleeId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_VideoCalls_Users_CallerId",
                table: "VideoCalls",
                column: "CallerId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TextChatMessages_Users_ReceiverId",
                table: "TextChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_TextChatMessages_Users_SenderId",
                table: "TextChatMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_VideoCalls_Users_CalleeId",
                table: "VideoCalls");

            migrationBuilder.DropForeignKey(
                name: "FK_VideoCalls_Users_CallerId",
                table: "VideoCalls");

            migrationBuilder.DropIndex(
                name: "IX_VideoCalls_CalleeId",
                table: "VideoCalls");

            migrationBuilder.DropIndex(
                name: "IX_VideoCalls_CallerId",
                table: "VideoCalls");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Users",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_TextChatMessages_ReceiverId",
                table: "TextChatMessages");

            migrationBuilder.DropIndex(
                name: "IX_TextChatMessages_SenderId",
                table: "TextChatMessages");

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Id",
                keyColumnType: "int",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "Id",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IsRead",
                table: "TextChatMessages");

            migrationBuilder.AlterColumn<string>(
                name: "CallerId",
                table: "VideoCalls",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "CalleeId",
                table: "VideoCalls",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "SenderId",
                table: "TextChatMessages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "ReceiverId",
                table: "TextChatMessages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Users",
                table: "Users",
                column: "UserName");

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "UserName", "Name" },
                values: new object[,]
                {
                    { "janedoe", "Jane Doe" },
                    { "johndoe", "John Doe" },
                    { "johnsmith", "John Smith" }
                });
        }
    }
}
