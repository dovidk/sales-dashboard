FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["SalesDashboard.Api.csproj", "./"]
RUN dotnet restore "./SalesDashboard.Api.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "SalesDashboard.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SalesDashboard.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SalesDashboard.Api.dll"]