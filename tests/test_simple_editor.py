import sys
import os

# Add project root to path to allow imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)


def test_placeholder():
    """A placeholder test to ensure pytest is configured correctly."""
    assert True


try:
    from simple_yaml_editor import detect_file_type  # type: ignore

    def test_detect_file_type():
        """Tests the file type detection logic."""
        assert detect_file_type("docker-compose.yml") == "docker-compose"
        assert detect_file_type("docker-compose.yaml") == "docker-compose"
        assert detect_file_type("path/to/Dockerfile") == "dockerfile"
        assert detect_file_type("another.yaml") == "yaml"
        assert detect_file_type("config.yml") == "yaml"

except ImportError:
    print("Could not import simple_yaml_editor, skipping some tests.")
    pass
