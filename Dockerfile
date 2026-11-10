# syntax=docker/dockerfile:1

# ── Build ────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so Docker can cache NuGet packages
COPY HasanBankApi.Server/HasanBankApi.Server.csproj HasanBankApi.Server/
RUN dotnet restore HasanBankApi.Server/HasanBankApi.Server.csproj

# Publish the API. The React app is already built into wwwroot.
COPY HasanBankApi.Server/ HasanBankApi.Server/
RUN dotnet publish HasanBankApi.Server/HasanBankApi.Server.csproj -c Release -o /out /p:UseAppHost=false

# ── Runtime ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

ENV ASPNETCORE_ENVIRONMENT=Production
ENV PORT=8080
EXPOSE 8080

COPY --from=build /out .
RUN mkdir -p /app/data && chown -R app:app /app
USER app

ENTRYPOINT ["dotnet", "HasanBankApi.Server.dll"]
