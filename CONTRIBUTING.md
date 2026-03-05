# Contributing to OpenBoil

Thank you for your interest in contributing to OpenBoil! We welcome contributions from the community.

## Getting Started

1. **Fork the repository** and clone it locally
2. **Install dependencies** with `npm install`
3. **Copy the environment file**: `cp .env.example .env`
4. **Start the dev server**: `npm run dev`

## Development Workflow

1. Create a new branch from `main` for your feature or fix
2. Make your changes with clear, descriptive commits
3. Test your changes locally
4. Submit a pull request

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Update documentation if your changes affect user-facing behavior
- Follow existing code style and patterns
- Test on both light and dark mode
- Ensure mobile responsiveness

## Project Structure

```
src/
├── components/     # React + Astro components
├── layouts/        # Page layouts
├── pages/          # File-based routing
├── lib/            # Utilities and providers
├── styles/         # Global CSS
└── config/         # App configuration
```

## Provider System

OpenBoil uses a provider abstraction. When adding new functionality:

- Place provider-specific code in `src/lib/providers/[provider-name]/`
- Export through the provider barrel file
- Register in `src/lib/providers/index.ts`

## Code Style

- TypeScript for all new files
- Use existing shadcn/ui components where possible
- Follow the Astro/React hybrid pattern used throughout the project
- Use Tailwind CSS classes — avoid custom CSS unless necessary

## Reporting Issues

- Use GitHub Issues for bug reports and feature requests
- Include reproduction steps for bugs
- Provide screenshots for UI-related issues

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
