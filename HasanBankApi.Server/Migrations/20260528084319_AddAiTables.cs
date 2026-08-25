using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HasanBankApi.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddAiTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ai_conversations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    client_id = table.Column<long>(type: "bigint", nullable: false),
                    title = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_conversations", x => x.id);
                    table.ForeignKey(
                        name: "FK_ai_conversations_clients_client_id",
                        column: x => x.client_id,
                        principalTable: "clients",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ai_messages",
                columns: table => new
                {
                    id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    conversation_id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    role = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ai_messages", x => x.id);
                    table.ForeignKey(
                        name: "FK_ai_messages_ai_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalTable: "ai_conversations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ai_conversations_client_id",
                table: "ai_conversations",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "IX_ai_messages_conversation_id",
                table: "ai_messages",
                column: "conversation_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ai_messages");

            migrationBuilder.DropTable(
                name: "ai_conversations");
        }
    }
}
