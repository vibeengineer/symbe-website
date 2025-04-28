import type {
  LinkDropdownStoryblok,
  LinkStoryblok,
  NavigationStoryblok,
} from "../../../storyblok/types";

type NavigationProps = {
  className?: string;
  blok: NavigationStoryblok;
};

export default function Navigation({ blok, className }: NavigationProps) {
  return (
    <nav className={className}>
      <div>
        {blok.logo?.filename && (
          <img src={blok.logo.filename} alt={blok.logo.alt ?? ""} />
        )}
      </div>
      <div>
        {blok.centreLinks?.map((link) => {
          if (link.component === "link") {
            const linkBlok = link as LinkStoryblok;
            const url = linkBlok.link?.cached_url || linkBlok.link?.url;
            return (
              <a key={linkBlok._uid} href={url}>
                {linkBlok.linkText}
              </a>
            );
          }

          if (link.component === "linkDropdown") {
            const dropdownBlok = link as LinkDropdownStoryblok;
            return (
              <div key={dropdownBlok._uid}>
                <span>{dropdownBlok.dropdownTitle}</span>
                <div>
                  {dropdownBlok.links?.map((dropdownLink) => {
                    const url =
                      dropdownLink.link?.cached_url || dropdownLink.link?.url;
                    return (
                      <a key={dropdownLink._uid} href={url}>
                        {dropdownLink.linkText}
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          }
          return null; // Or handle other potential types if necessary
        })}
      </div>
      <div>
        {blok.rightLinks?.map((link) => {
          const url = link.link?.cached_url || link.link?.url;
          return (
            <a key={link._uid} href={url}>
              {link.linkText}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
