{ pkgs, ... }: {
  packages = [
    pkgs.nodejs_20
  ];
  idx = {
    extensions = [
      "esbenp.prettier-vscode"
    ];
    workspace = {
      onCreate = {};
      onStart = {};
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev"];
          manager = "web";
        };
      };
    };
  };
}